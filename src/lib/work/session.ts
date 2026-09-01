import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_TTL_SEC,
  isProduction,
  sessionSecret,
} from "./config";
import { base64url, randomId, sign, verifySignature } from "./crypto";

/** Secure 属性が付けられる本番でのみ __Host- 接頭辞を使う */
export const SESSION_COOKIE = isProduction()
  ? "__Host-rf_session"
  : "rf_session";

interface SessionPayload {
  /** ユーザーID */
  uid: string;
  /** セッションID（ログアウト・監査用） */
  sid: string;
  /** 発行時刻(UNIX秒) */
  iat: number;
  /** 失効時刻(UNIX秒) */
  exp: number;
}

function encode(payload: SessionPayload): string {
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body, sessionSecret())}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!verifySignature(body, signature, sessionSecret())) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload?.uid !== "string" || typeof payload?.exp !== "number") {
    return null;
  }
  if (payload.exp * 1000 <= Date.now()) return null;
  return payload;
}

function cookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export async function createSession(uid: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = encode({
    uid,
    sid: randomId(),
    iat: now,
    exp: now + SESSION_TTL_SEC,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_SEC));
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decode(store.get(SESSION_COOKIE)?.value);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(0));
}

/**
 * 有効期限の残りが半分を切っていたら発行し直す（スライディング更新）。
 * Cookie を書ける文脈（Server Action / Route Handler）からのみ呼ぶこと。
 */
export async function renewSessionIfStale(
  payload: SessionPayload,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp - now > SESSION_TTL_SEC / 2) return;
  await createSession(payload.uid);
}
