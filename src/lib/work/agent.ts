import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod";

import { relativeLabel, todayJst, weekdayJa } from "./date";
import { parseBrainDump } from "./offlineParser";
import {
  buildNudges,
  buildTodayPlan,
  isOpen,
  summarize,
} from "./planner";
import {
  TaskDraft,
  addTasks,
  completeTask,
  getWorkspace,
  patchTask,
  removeTask,
} from "./tasks";
import { ChatMessage, TASK_CATEGORIES, Task } from "./types";

// 対話用途なので、思考は既定(adaptive)のまま effort を medium に落として応答を早くする。
// 判断が甘いと感じたら "high" に上げる。
const MODEL = "claude-opus-5";
const EFFORT = "medium" as const;
const MAX_TOKENS = 8000;
// 秘書の1往復にかける上限。UI が固まらないように短めに切る
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_ITERATIONS = 8;
/** プロンプトに載せる会話履歴の往復数 */
const HISTORY_TURNS = 12;

export interface AgentReply {
  text: string;
  actions: string[];
  /** true = APIキーが無く、簡易パーサで処理した */
  offline: boolean;
}

/* ------------------------------------------------------------------ *
 * ツール定義
 * ------------------------------------------------------------------ */

const priorityEnum = z.enum(["high", "mid", "low"]);
const categoryEnum = z.enum(TASK_CATEGORIES);
const repeatEnum = z.enum(["none", "daily", "weekly", "monthly"]);
const statusEnum = z.enum(["todo", "doing", "done", "dropped"]);
const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で指定してください");

const taskInput = z.object({
  title: z.string().describe("何をするかが一目で分かる短い日本語。20文字前後"),
  detail: z.string().describe("補足。不要なら空文字"),
  priority: priorityEnum.describe(
    "high=今日中にやらないと困る / mid=通常 / low=急がない",
  ),
  category: categoryEnum,
  dueDate: ymd.nullable().describe("期限。指定が無ければ null"),
  estimateMin: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe("見積り作業時間(分)。見当がつかなければ null"),
  repeat: repeatEnum.describe("繰り返し。単発なら none"),
});

/** 秘書に渡すタスク一覧を、トークンを抑えた1行表現にする */
function renderTask(task: Task, today: string): string {
  const due = task.dueDate
    ? `期限${task.dueDate}(${relativeLabel(task.dueDate, today)})`
    : "期限なし";
  const est = task.estimateMin ? `${task.estimateMin}分` : "見積なし";
  const postpone =
    task.postponeCount > 0 ? ` 先送り${task.postponeCount}回` : "";
  return `- [${task.id}] ${task.title} / ${task.status} / ${task.priority} / ${task.category} / ${due} / ${est}${postpone}`;
}

function buildTools(userId: string, actions: string[]) {
  return [
    betaZodTool({
      name: "create_tasks",
      description:
        "新しいタスクを登録する。走り書きから複数のタスクを読み取った場合は、1回の呼び出しでまとめて渡すこと。",
      inputSchema: z.object({ tasks: z.array(taskInput).min(1).max(20) }),
      run: async ({ tasks }) => {
        const created = await addTasks(userId, tasks as TaskDraft[], "agent");
        for (const task of created) {
          actions.push(`登録: ${task.title}`);
        }
        return JSON.stringify({
          created: created.map((t) => ({ id: t.id, title: t.title })),
        });
      },
    }),

    betaZodTool({
      name: "update_task",
      description:
        "既存タスクを編集する。変更したい項目だけ指定する。期限を後ろにずらすと先送り回数が増える。",
      inputSchema: z.object({
        id: z.string(),
        title: z.string().optional(),
        detail: z.string().optional(),
        status: statusEnum.optional(),
        priority: priorityEnum.optional(),
        category: categoryEnum.optional(),
        dueDate: ymd.nullable().optional(),
        estimateMin: z.number().int().positive().nullable().optional(),
        repeat: repeatEnum.optional(),
      }),
      run: async ({ id, ...patch }) => {
        const updated = await patchTask(userId, id, patch);
        if (!updated) return JSON.stringify({ error: "該当タスクなし" });
        actions.push(`更新: ${updated.title}`);
        return JSON.stringify({ ok: true, task: renderTask(updated, todayJst()) });
      },
    }),

    betaZodTool({
      name: "complete_task",
      description:
        "タスクを完了にする。繰り返し設定があれば次回分は自動で作られるので、別途 create_tasks を呼ばないこと。",
      inputSchema: z.object({ id: z.string() }),
      run: async ({ id }) => {
        const done = await completeTask(userId, id);
        if (!done) return JSON.stringify({ error: "該当タスクなし" });
        actions.push(`完了: ${done.title}`);
        return JSON.stringify({ ok: true });
      },
    }),

    betaZodTool({
      name: "delete_task",
      description:
        "タスクを完全に削除する。やらないと決めた場合は削除ではなく update_task で status=dropped を使うほうがよい。",
      inputSchema: z.object({ id: z.string() }),
      run: async ({ id }) => {
        const removed = await removeTask(userId, id);
        if (removed) actions.push(`削除: ${id}`);
        return JSON.stringify({ ok: removed });
      },
    }),

    betaZodTool({
      name: "list_tasks",
      description:
        "タスクを検索する。システムプロンプトには未完了タスクだけが載っているため、完了済みや過去の履歴を調べたいときに使う。",
      inputSchema: z.object({
        status: statusEnum.nullable().describe("絞り込む状態。全件なら null"),
        keyword: z.string().nullable().describe("タイトル・詳細の部分一致。不要なら null"),
      }),
      run: async ({ status, keyword }) => {
        const { tasks } = await getWorkspace(userId);
        const today = todayJst();
        const hit = tasks
          .filter((t) => (status ? t.status === status : true))
          .filter((t) =>
            keyword
              ? t.title.includes(keyword) || t.detail.includes(keyword)
              : true,
          )
          .slice(0, 60);
        return hit.length
          ? hit.map((t) => renderTask(t, today)).join("\n")
          : "該当なし";
      },
    }),
  ];
}

/* ------------------------------------------------------------------ *
 * プロンプト
 * ------------------------------------------------------------------ */

// 日付や件数を含めない固定部分。プロンプトキャッシュのために先頭へ置く
const STATIC_SYSTEM = `あなたはメダカ養殖・販売を営む個人事業主の業務秘書です。日本語で応答します。

利用者の特徴:
- これまで自分でタスク管理をしてこなかったため、細かい分類や運用ルールを押し付けると続きません。
- スマホをほとんど見られない環境で働いているため、ブラウザを開いたその瞬間に必要な判断材料が揃っている必要があります。
- リマインドを自分で設定するのが苦手です。だから利用者に「登録しておいてください」と促すのではなく、あなたが会話の中で登録まで済ませてください。

振る舞いの原則:
1. 走り書き・断片的なメモを受け取ったら、確認を挟まず create_tasks で登録まで行う。推測した期限や優先度は、登録後の返答で「こう解釈した」と一言添えて訂正できるようにする。
2. 曖昧でも止まらない。期限が読み取れなければ null のままにして登録し、返答で確認する。質問だけして何も登録しないのは避ける。
3. 「今日なにをすべきか」を聞かれたら、件数を絞って上から3〜5件だけ挙げる。全部並べると選べません。
4. 期限を後ろ倒しにする相談には、まず「本当に今日やらなくていいか」を一度だけ問い返す。押し返されたら素直にずらす。
5. 返答は短く。箇条書きを使い、前置きと復唱はしない。マークダウンの見出しや太字は使わない。
6. タスクの状態を変えたときは、何をどう変えたかを必ず1行で報告する。

分類の基準:
- 世話: 給餌・水換え・選別・採卵など日々の飼育作業
- 出荷: 梱包・発送・納品
- 仕入: 資材や生体の発注・購入
- 販促: SNS投稿・撮影・イベント・出品
- 事務: 請求・入金・申告・書類・連絡
- その他: 上記に当てはまらないもの`;

/** 日付や現在のタスクなど、毎回変わる部分 */
function dynamicContext(
  today: string,
  tasks: Task[],
  capacityMin: number,
): string {
  const open = tasks.filter(isOpen);
  const stats = summarize(tasks, today);
  const { plan } = buildTodayPlan(tasks, today, capacityMin);
  const nudges = buildNudges(tasks, today);

  const lines = [
    `今日は ${today}(${weekdayJa(today)})。1日に使える作業時間の目安は ${capacityMin} 分。`,
    `未完了 ${stats.open}件 / 期限超過 ${stats.overdue}件 / 今日が期限 ${stats.dueToday}件 / 今日の完了 ${stats.doneToday}件。`,
    "",
    "現在の未完了タスク（[id] タイトル / 状態 / 優先度 / 分類 / 期限 / 見積り）:",
    open.length
      ? open.map((t) => renderTask(t, today)).join("\n")
      : "(未完了タスクはありません)",
  ];

  if (plan.length) {
    lines.push(
      "",
      "システムが機械的に算出した今日の推奨順（あなたの判断で入れ替えて構いません）:",
      plan
        .slice(0, 8)
        .map((p, i) => `${i + 1}. ${p.task.title}（${p.reasons.join("・")}）`)
        .join("\n"),
    );
  }

  if (nudges.length) {
    lines.push(
      "",
      "放置が気になる項目:",
      nudges
        .slice(0, 8)
        .map((n) => `- ${n.title}: ${n.message}`)
        .join("\n"),
    );
  }

  return lines.join("\n");
}

/* ------------------------------------------------------------------ *
 * 実行
 * ------------------------------------------------------------------ */

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
  return client;
}

/**
 * AI秘書に1往復させる。
 * APIキーが無い場合は簡易パーサで最低限のタスク化を行う。
 */
export async function runAgent(
  userId: string,
  userMessage: string,
  history: ChatMessage[],
): Promise<AgentReply> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return runOffline(userId, userMessage);
  }

  const { tasks, settings } = await getWorkspace(userId);
  const today = todayJst();
  const actions: string[] = [];

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history.slice(-HISTORY_TURNS).map((m) => ({
      role: m.role,
      content: m.text,
    })),
    { role: "user" as const, content: userMessage },
  ];

  try {
    const final = await getClient().beta.messages.toolRunner({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: EFFORT },
      max_iterations: MAX_ITERATIONS,
      system: [
        // 固定部分をキャッシュし、日々変わる文脈はその後ろに置く
        { type: "text", text: STATIC_SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: dynamicContext(today, tasks, settings.dailyCapacityMin) },
      ],
      tools: buildTools(userId, actions),
      messages,
    });

    if (final.stop_reason === "refusal") {
      return {
        text: "この内容には回答できませんでした。表現を変えてもう一度お試しください。",
        actions,
        offline: false,
      };
    }

    const text = final.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return {
      text: text || "（応答が空でした。もう一度お試しください）",
      actions,
      offline: false,
    };
  } catch (error) {
    return { text: describeError(error), actions, offline: false };
  }
}

function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "AIの認証に失敗しました。ANTHROPIC_API_KEY を確認してください。";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "AIの利用制限に達しました。少し時間をおいてからお試しください。";
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return "AIの応答が時間内に返りませんでした。もう一度お試しください。";
  }
  if (error instanceof Anthropic.APIError) {
    return `AIとの通信でエラーが発生しました（${error.status ?? "不明"}）。時間をおいてお試しください。`;
  }
  // 想定外の例外の中身は利用者に出さず、サーバー側にだけ残す
  console.error("[work/agent] unexpected error", error);
  return "処理中にエラーが発生しました。もう一度お試しください。";
}

/** APIキーが無いときの代替。書き殴りの登録だけは通す */
async function runOffline(
  userId: string,
  userMessage: string,
): Promise<AgentReply> {
  const { drafts, note } = parseBrainDump(userMessage);
  const created = await addTasks(userId, drafts, "agent");
  const actions = created.map((t) => `登録: ${t.title}`);

  const lines = [
    "AI未接続のため、簡易解析で処理しました（ANTHROPIC_API_KEY を設定すると相談もできます）。",
    note,
  ];
  if (created.length) {
    lines.push(
      "",
      ...created.map((t) => {
        const due = t.dueDate ? `期限 ${t.dueDate}` : "期限なし";
        return `・${t.title}（${t.category} / ${due}）`;
      }),
    );
  }

  return { text: lines.join("\n"), actions, offline: true };
}
