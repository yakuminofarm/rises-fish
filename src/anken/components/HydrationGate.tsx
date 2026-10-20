"use client";

import { useEffect, useState } from "react";
import { useAnken } from "../store";

/** ブラウザに保存したデータを読み込んでから画面を出す */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = useAnken.persist.onFinishHydration(() => setReady(true));
    void useAnken.persist.rehydrate();
    return unsub;
  }, []);

  if (!ready) {
    return (
      <div className="anken grid min-h-screen place-items-center text-[13px] text-ak-ink3">読み込んでいます…</div>
    );
  }
  return <>{children}</>;
}
