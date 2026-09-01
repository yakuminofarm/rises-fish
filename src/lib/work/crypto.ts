import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// scrypt パラメータ。N=2^15 は 2026 年時点の対話ログインとして十分な強度。
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 32 };
// maxmem は 128*N*r を超える必要がある（既定 32MB では N=32768 が通らない）
const MAXMEM = 128 * SCRYPT.N * SCRYPT.r * 2;

/** `scrypt$N$r$p$<salt b64>$<hash b64>` 形式の文字列を作る */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: MAXMEM,
  });
  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");
}

/**
 * 保存済みハッシュとパスワードを比較する。
 * 失敗時も同じ経路を通し、比較は timingSafeEqual で行う。
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  const actual = await scrypt(password.normalize("NFKC"), salt, expected.length, {
    N,
    r,
    p,
    maxmem: 128 * N * r * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** HMAC-SHA256 の base64url 署名 */
export function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** 署名の一致を定数時間で確認する */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function randomId(bytes = 12): string {
  return randomBytes(bytes).toString("base64url");
}
