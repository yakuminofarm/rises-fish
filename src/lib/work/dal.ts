import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";

export interface AuthedSession {
  userId: string;
}

/**
 * セッションを確認する。1リクエスト内で何度呼んでも Cookie 検証は1回。
 * データに触る処理は必ずここを通すこと（Server Action / Route Handler 含む）。
 */
export const verifySession = cache(async (): Promise<AuthedSession | null> => {
  const payload = await readSession();
  return payload ? { userId: payload.uid } : null;
});

/** 未ログインならログイン画面へ飛ばす。ページ用 */
export async function requireSession(): Promise<AuthedSession> {
  const session = await verifySession();
  if (!session) redirect("/work/login");
  return session;
}

/** 未ログインなら例外。Server Action 用（直接 POST されても止まる） */
export async function requireSessionForAction(): Promise<AuthedSession> {
  const session = await verifySession();
  if (!session) throw new Error("認証が必要です。ログインし直してください。");
  return session;
}
