"use client";

import { useEffect } from "react";

/**
 * ホーム画面に置いたときに、電波がなくても開けるようにする。
 * scope は /kuwagata なので、めだか手帳側は素のままで動く。
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    // Artifact など /kuwagata 以外で開かれている場合は何もしない
    if (!window.location.pathname.startsWith("/kuwagata")) return;

    navigator.serviceWorker
      .register("/sw-kuwarabo.js", { scope: "/kuwagata" })
      .catch(() => {
        // オフライン対応は無くても本体は動くので、失敗しても黙って諦める
      });
  }, []);

  return null;
}
