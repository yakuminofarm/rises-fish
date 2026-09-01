import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { WorkspaceData, emptyWorkspace } from "./types";

const DATA_DIR = process.env.WORK_DATA_DIR
  ? path.resolve(process.env.WORK_DATA_DIR)
  : path.join(process.cwd(), ".data");

/**
 * ユーザーIDからファイル名を作る。
 * 経路探索を防ぐため、英数字以外は落としてから使う。
 */
function fileFor(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "") || "user";
  return path.join(DATA_DIR, `workspace-${safe}.json`);
}

/**
 * 読み込み→変更→書き込みの間に別リクエストが割り込むと更新が消える。
 * ユーザーごとに直列化して防ぐ。
 */
const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  // 失敗しても後続を止めない
  locks.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

export async function readWorkspace(userId: string): Promise<WorkspaceData> {
  try {
    const raw = await readFile(fileFor(userId), "utf8");
    const parsed = JSON.parse(raw) as WorkspaceData;
    if (parsed?.version !== 1 || !Array.isArray(parsed.tasks)) {
      return emptyWorkspace();
    }
    return {
      ...emptyWorkspace(),
      ...parsed,
      settings: { ...emptyWorkspace().settings, ...parsed.settings },
    };
  } catch {
    // 未作成・壊れている場合は空のワークスペースとして扱う
    return emptyWorkspace();
  }
}

/** 一時ファイルへ書いてから rename する（途中で落ちても壊れない） */
async function writeWorkspace(
  userId: string,
  data: WorkspaceData,
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const target = fileFor(userId);
  const tmp = `${target}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(tmp, target);
}

/** 読み→変更→保存をまとめて直列実行する */
export function updateWorkspace<T>(
  userId: string,
  mutate: (data: WorkspaceData) => T | Promise<T>,
): Promise<{ data: WorkspaceData; result: T }> {
  return withLock(userId, async () => {
    const data = await readWorkspace(userId);
    const result = await mutate(data);
    await writeWorkspace(userId, data);
    return { data, result };
  });
}
