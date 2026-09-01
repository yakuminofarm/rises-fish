import type { Metadata } from "next";
import { connection } from "next/server";

import {
  AUTH_USER,
  DEV_FALLBACK_PASSWORD,
  isProduction,
  isSetupIncomplete,
} from "@/lib/work/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン | 業務秘書",
  // 認証画面はインデックスさせない
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // 設定状況は環境変数から読む。ビルド時の値を焼き込まないよう、
  // 必ずリクエスト時に評価させる。
  await connection();

  const setupIncomplete = isSetupIncomplete();
  const devMode = setupIncomplete && !isProduction();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">業務秘書</h1>
          <p className="mt-1 text-sm text-slate-500">
            やることの管理とAIによる段取り
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm defaultUser={AUTH_USER} />
        </div>

        {devMode && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">開発モードで動作しています</p>
            <p className="mt-1 leading-relaxed">
              パスワードが未設定のため、仮パスワード
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                {DEV_FALLBACK_PASSWORD}
              </code>
              でログインできます。公開する前に必ず
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                npm run work:setup
              </code>
              で認証情報を作成してください。
            </p>
          </div>
        )}

        {setupIncomplete && isProduction() && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
            <p className="font-semibold">セットアップが未完了です</p>
            <p className="mt-1 leading-relaxed">
              WORK_PASSWORD_HASH と SESSION_SECRET が設定されていないため、
              ログインは受け付けられません。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
