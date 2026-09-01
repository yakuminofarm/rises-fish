import "server-only";

import { randomBytes } from "node:crypto";

const isProd = process.env.NODE_ENV === "production";

/**
 * 開発時にだけ使う一時シークレット。
 * プロセスを再起動するとセッションは無効になる（=漏れても持ち越されない）。
 */
let devSecret: string | null = null;
function ephemeralDevSecret(): string {
  devSecret ??= randomBytes(32).toString("base64");
  return devSecret;
}

/** セッション Cookie の署名鍵 */
export function sessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  if (isProd) {
    throw new Error(
      "SESSION_SECRET が未設定、または32文字未満です。`npm run work:setup` で生成した値を環境変数に設定してください。",
    );
  }
  return ephemeralDevSecret();
}

export const AUTH_USER = process.env.WORK_USER || "admin";

/** 未設定なら null。null のとき本番はログイン不可、開発は仮パスワードで通す */
export function passwordHash(): string | null {
  const hash = process.env.WORK_PASSWORD_HASH;
  return hash && hash.startsWith("scrypt$") ? hash : null;
}

/** 開発用の仮パスワード。本番では絶対に使われない */
export const DEV_FALLBACK_PASSWORD = "medaka-dev";

export function isSetupIncomplete(): boolean {
  return passwordHash() === null;
}

export function isProduction(): boolean {
  return isProd;
}

/** AI 秘書が使えるか（APIキーの有無）。鍵そのものは絶対に返さない */
export function hasAgentKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** セッション有効期間（秒）: 8時間 */
export const SESSION_TTL_SEC = 8 * 60 * 60;

/** ログイン試行の上限と観測窓 */
export const LOGIN_MAX_ATTEMPTS = 8;
export const LOGIN_WINDOW_MS = 10 * 60 * 1000;
