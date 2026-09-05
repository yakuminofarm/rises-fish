/**
 * くわらぼのサービスワーカー (電波がなくても開けるようにする)。
 *
 * scope は /kuwagata なので、めだか手帳側には一切影響しない。
 * スクリプト自体を公開ルートに置いているのは、SWが持てる scope が
 * 「自分の置き場所より下」に限られるため。/kuwagata/sw.js だと
 * scope が /kuwagata/ 止まりになり、末尾スラッシュ無しの /kuwagata を
 * 制御できずオフラインで開けなくなる。
 * データは localStorage にあるので、画面さえ出れば記録・閲覧はそのまま使える。
 */
const CACHE = "kuwarabo-v1";
const PAGE = "/kuwagata";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(PAGE))
      .catch(() => {}) // 初回がオフラインでも install は失敗させない
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // 画面本体はネット優先。更新をキャッシュで握りつぶさないため。
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(PAGE, copy));
          }
          return res;
        })
        .catch(() => caches.match(PAGE).then((hit) => hit || Response.error()))
    );
    return;
  }

  // ビルド済みの静的ファイルはキャッシュ優先。
  // ファイル名にハッシュが入るので、中身が変われば別URLになり古いものは掴まない。
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
