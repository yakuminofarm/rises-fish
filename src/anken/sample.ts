import { addDays, todayISO } from "./date";
import type { Activity, Party, Project, Request, Task } from "./types";

// 試作用のサンプルデータ。日付はすべて「今日」からの相対で作る

export const CURRENT_USER_ID = "m1";

export const SAMPLE_PARTIES: Party[] = [
  { id: "m1", name: "あなた", org: "営業企画課", kind: "member", short: "自" },
  { id: "m2", name: "田中", org: "営業企画課", kind: "member", short: "田" },
  { id: "m3", name: "佐藤", org: "営業企画課", kind: "member", short: "佐" },
  { id: "c1", name: "山本", org: "店舗運営部", kind: "client", short: "店" },
  { id: "c2", name: "小林", org: "商品部", kind: "client", short: "商" },
  { id: "c3", name: "高橋", org: "EC事業部", kind: "client", short: "E" },
  { id: "v1", name: "鈴木", org: "デザイン事務所", kind: "vendor", short: "デ" },
  { id: "v2", name: "森田", org: "印刷会社", kind: "vendor", short: "印" },
];

export interface SampleData {
  parties: Party[];
  projects: Project[];
  tasks: Task[];
  requests: Request[];
  activities: Activity[];
}

export function buildSample(): SampleData {
  const T = todayISO();
  const d = (n: number) => addDays(T, n);
  const at = (n: number, hm: string) => `${d(n)}T${hm}:00`;

  const projects: Project[] = [
    { id: "p1", title: "春の新生活キャンペーン 店頭POP・チラシ", category: "promo", ownerId: "m2", clientId: "c1", vendorId: "v1", due: d(13), priority: "both", createdAt: d(-24), done: false },
    { id: "p2", title: "ショップサイト 商品ページ改修", category: "web", ownerId: "m1", clientId: "c2", due: d(10), priority: "important", createdAt: d(-20), done: false },
    { id: "p3", title: "会員向けサブスク企画", category: "service", ownerId: "m1", clientId: "c3", due: d(60), priority: "important", createdAt: d(-30), done: false },
    { id: "p4", title: "年末商戦 DM", category: "promo", ownerId: "m2", clientId: "c1", vendorId: "v2", due: d(30), priority: "urgent", createdAt: d(-6), done: false },
    { id: "p5", title: "新商品LP 問い合わせフォーム改善", category: "web", ownerId: "m3", clientId: "c2", due: d(21), priority: "neither", createdAt: d(-4), done: false },
    { id: "p6", title: "年末年始 営業時間告知POP", category: "promo", ownerId: "m2", clientId: "c1", vendorId: "v1", due: d(31), priority: "important", createdAt: d(-2), done: false },
  ];

  let n = 0;
  const t = (p: Partial<Task> & Pick<Task, "projectId" | "title" | "assigneeId" | "start" | "due" | "status">): Task => ({
    id: `t${++n}`,
    side: "us",
    ballId: p.assigneeId,
    ballSince: p.start,
    order: n,
    ...p,
  });

  const tasks: Task[] = [
    // p1 春の新生活
    t({ projectId: "p1", title: "企画・要件まとめ", step: "企画・要件", assigneeId: "m2", start: d(-24), due: d(-17), status: "done", doneAt: d(-17) }),
    t({ projectId: "p1", title: "POP・チラシのデザイン初校", step: "デザイン（外注先）", side: "vendor", assigneeId: "m1", start: d(-17), due: d(-8), status: "done", doneAt: d(-8) }),
    t({ projectId: "p1", title: "チラシ初校の校正", step: "社内クライアント校正", side: "client", assigneeId: "m1", ballId: "c1", ballSince: d(-5), start: d(-6), due: d(-1), status: "waiting" }),
    t({ projectId: "p1", title: "POP初校の修正指示を外注先へ", step: "社内クライアント校正", assigneeId: "m1", start: d(-6), due: d(-3), status: "doing" }),
    t({ projectId: "p1", title: "印刷会社へ入稿", step: "入稿", assigneeId: "m2", start: d(1), due: d(3), status: "todo" }),
    t({ projectId: "p1", title: "印刷・店舗への納品", step: "印刷・納品（外注先）", side: "vendor", assigneeId: "m2", start: d(3), due: d(13), status: "todo" }),
    // p2 ショップ商品ページ
    t({ projectId: "p2", title: "改修範囲の要件整理", step: "要件整理", assigneeId: "m1", start: d(-20), due: d(-15), status: "done", doneAt: d(-15) }),
    t({ projectId: "p2", title: "商品ページの構成・原稿", step: "構成・原稿", assigneeId: "m1", start: d(-15), due: d(-9), status: "done", doneAt: d(-10) }),
    t({ projectId: "p2", title: "商品詳細ページのデザイン", step: "デザイン", assigneeId: "m3", start: d(-9), due: d(-3), status: "done", doneAt: d(-3) }),
    t({ projectId: "p2", title: "商品詳細ページのコーディング", step: "実装（自社）", assigneeId: "m1", start: d(-3), due: d(0), status: "doing" }),
    t({ projectId: "p2", title: "商品ページ用の写真素材", step: "実装（自社）", side: "client", assigneeId: "m1", ballId: "c2", ballSince: d(-2), start: d(-3), due: d(2), status: "waiting" }),
    t({ projectId: "p2", title: "商品部の確認・OK", step: "社内クライアント確認", side: "client", assigneeId: "m1", start: d(3), due: d(7), status: "todo" }),
    t({ projectId: "p2", title: "本番公開", step: "公開", assigneeId: "m1", start: d(8), due: d(10), status: "todo" }),
    // p3 サブスク
    t({ projectId: "p3", title: "サービス構想メモ", step: "構想", assigneeId: "m1", start: d(-30), due: d(-16), status: "done", doneAt: d(-16) }),
    t({ projectId: "p3", title: "競合サービス価格表の作成", step: "市場・顧客調査", assigneeId: "m1", start: d(-10), due: d(2), status: "doing" }),
    t({ projectId: "p3", title: "会員アンケートの設計", step: "市場・顧客調査", assigneeId: "m3", start: d(0), due: d(9), status: "todo" }),
    t({ projectId: "p3", title: "EC事業部・部長の承認", step: "社内クライアント・上長承認", side: "client", assigneeId: "m1", start: d(10), due: d(20), status: "todo" }),
    // p4 年末商戦 DM
    t({ projectId: "p4", title: "DM宛名リスト抽出依頼", step: "企画・要件", assigneeId: "m1", start: d(0), due: d(4), status: "todo" }),
    t({ projectId: "p4", title: "DM印刷の見積もり", step: "企画・要件", side: "vendor", assigneeId: "m2", ballId: "v2", ballSince: d(-1), start: d(-2), due: d(5), status: "waiting" }),
    t({ projectId: "p4", title: "DMデザイン（外注先）", step: "デザイン（外注先）", side: "vendor", assigneeId: "m2", start: d(5), due: d(14), status: "todo" }),
    // p5 フォーム改善
    t({ projectId: "p5", title: "入力項目の削減案", step: "要件整理", assigneeId: "m3", start: d(-4), due: d(1), status: "review" }),
    t({ projectId: "p5", title: "フォーム改善の要件まとめ", step: "要件整理", assigneeId: "m1", start: d(1), due: d(8), status: "todo" }),
    t({ projectId: "p5", title: "フォームの実装", step: "実装（自社）", assigneeId: "m3", start: d(8), due: d(15), status: "todo" }),
    // p6 年末年始POP
    t({ projectId: "p6", title: "告知内容の確認", step: "企画・要件", assigneeId: "m2", start: d(-2), due: d(-1), status: "done", doneAt: d(-1) }),
    t({ projectId: "p6", title: "POPデザイン2案", step: "デザイン（外注先）", side: "vendor", assigneeId: "m2", ballId: "v1", ballSince: d(-1), start: d(-1), due: d(3), status: "waiting" }),
    t({ projectId: "p6", title: "店舗運営部の校正", step: "社内クライアント校正", side: "client", assigneeId: "m2", start: d(4), due: d(10), status: "todo" }),
  ];

  const requests: Request[] = [
    { id: "r1", title: "店頭用の会員アプリ案内POPを作ってほしい", fromId: "c1", source: "form", receivedAt: at(0, "09:12"), desiredDue: d(31), note: "全42店舗分。A4とA3の2サイズ希望。", state: "new" },
    { id: "r2", title: "新商品のLPを来月中旬までに公開したい", fromId: "c2", source: "chatwork", receivedAt: at(-1, "16:40"), desiredDue: d(25), note: "商品写真は来週撮影予定とのこと。", state: "new" },
    { id: "r3", title: "ショップのカート画面で送料表示が分かりにくい", fromId: "c3", source: "mail", receivedAt: at(-2, "11:05"), note: "問い合わせが先月から増えている。", state: "new" },
    { id: "r4", title: "展示会ブースのノベルティ案を検討", fromId: "m1", source: "memo", receivedAt: at(-3, "18:20"), state: "new" },
    { id: "r5", title: "社内報向けにキャンペーン実績をまとめてほしい", fromId: "c3", source: "line", receivedAt: at(-6, "10:00"), state: "hold" },
  ];

  const activities: Activity[] = [
    { id: "a1", projectId: "p1", at: at(-8, "17:30"), actorId: "system", text: "「POP・チラシのデザイン初校」が完了しました" },
    { id: "a2", projectId: "p1", taskId: "t3", at: at(-5, "10:05"), actorId: "system", text: "ボールが あなた → 店舗運営部 山本さん に移りました" },
    { id: "a3", projectId: "p1", at: at(-4, "14:02"), actorId: "c1", text: "裏面の店舗一覧、閉店予定の2店を外してください。チラシは今週中に戻します。" },
    { id: "a4", projectId: "p1", at: at(-4, "14:30"), actorId: "m1", text: "承知しました。POPのほうは先に外注先へ修正を依頼しておきます。" },
    { id: "a5", projectId: "p2", taskId: "t11", at: at(-2, "09:40"), actorId: "system", text: "ボールが あなた → 商品部 小林さん に移りました" },
  ];

  return { parties: SAMPLE_PARTIES, projects, tasks, requests, activities };
}
