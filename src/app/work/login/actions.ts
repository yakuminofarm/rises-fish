"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_USER,
  DEV_FALLBACK_PASSWORD,
  isProduction,
  passwordHash,
} from "@/lib/work/config";
import { verifyPassword } from "@/lib/work/crypto";
import {
  clearFailures,
  isLockedOut,
  lockoutMinutesLeft,
  recordFailure,
} from "@/lib/work/rateLimit";
import { createSession, destroySession } from "@/lib/work/session";

export interface LoginState {
  error: string | null;
}

/** 試行回数を数える単位。リバースプロキシ配下では X-Forwarded-For の先頭を使う */
async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const key = await clientKey();

  if (isLockedOut(key)) {
    return {
      error: `試行回数の上限に達しました。${lockoutMinutesLeft(key)}分ほど待ってからお試しください。`,
    };
  }

  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  const stored = passwordHash();

  let ok = false;
  if (stored) {
    // ユーザー名が違っても必ずハッシュ計算を通し、応答時間から推測されないようにする
    const userMatches = user === AUTH_USER;
    const passwordMatches = await verifyPassword(password, stored);
    ok = userMatches && passwordMatches;
  } else if (!isProduction()) {
    // 未設定の開発環境のみ、既知の仮パスワードで通す
    ok = user === AUTH_USER && password === DEV_FALLBACK_PASSWORD;
  } else {
    return {
      error:
        "パスワードが未設定のため、ログインできません。サーバー側で WORK_PASSWORD_HASH を設定してください。",
    };
  }

  if (!ok) {
    recordFailure(key);
    return { error: "ユーザー名またはパスワードが違います。" };
  }

  clearFailures(key);
  await createSession(AUTH_USER);
  redirect("/work");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/work/login");
}
