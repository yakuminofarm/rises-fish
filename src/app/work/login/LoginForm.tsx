"use client";

import { useActionState } from "react";
import { LoginState, login } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm({ defaultUser }: { defaultUser: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="user"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          ユーザー名
        </label>
        <input
          id="user"
          name="user"
          type="text"
          autoComplete="username"
          defaultValue={defaultUser}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "確認中…" : "ログイン"}
      </button>
    </form>
  );
}
