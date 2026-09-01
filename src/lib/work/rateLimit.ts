import "server-only";

import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "./config";

interface Bucket {
  count: number;
  firstAt: number;
}

// プロセス内メモリ。単一サーバー運用を前提とした簡易実装。
// 複数インスタンスで動かす場合は Redis などに置き換えること。
const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.firstAt > LOGIN_WINDOW_MS) buckets.delete(key);
  }
}

export function isLockedOut(key: string): boolean {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (now - bucket.firstAt > LOGIN_WINDOW_MS) {
    buckets.delete(key);
    return false;
  }
  return bucket.count >= LOGIN_MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.firstAt > LOGIN_WINDOW_MS) {
    buckets.set(key, { count: 1, firstAt: now });
    return;
  }
  bucket.count += 1;
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}

/** ロック解除までの残り分数 */
export function lockoutMinutesLeft(key: string): number {
  const bucket = buckets.get(key);
  if (!bucket) return 0;
  const left = LOGIN_WINDOW_MS - (Date.now() - bucket.firstAt);
  return Math.max(Math.ceil(left / 60_000), 1);
}
