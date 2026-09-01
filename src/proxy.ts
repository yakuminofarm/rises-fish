import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 では middleware は proxy に改名された。
// ここで行うのは「安く弾けるもの」だけ。本当の認可判定は必ずサーバー側
// （src/lib/work/dal.ts の verifySession）で行うこと。

const SESSION_COOKIES = ["__Host-rf_session", "rf_session"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)));
}

/**
 * CSRF 対策の一次防御。Cookie は SameSite=strict だが、
 * Server Action / Route Handler への POST は Origin も突き合わせる。
 */
function isCrossOriginWrite(request: NextRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD") return false;

  const origin = request.headers.get("origin");
  if (!origin) return false; // 同一オリジンのフォーム POST は Origin を送らない場合がある

  const host = request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isCrossOriginWrite(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const isLoginPage = pathname === "/work/login";
  const signedIn = hasSessionCookie(request);

  // 未ログインで業務ツールを開いたらログイン画面へ
  if (!isLoginPage && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/work/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ログイン済みでログイン画面を開いたらダッシュボードへ
  if (isLoginPage && signedIn && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = "/work";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 業務データを含む画面は中間キャッシュにも履歴にも残さない。
  // next.config.ts の headers() は動的ルートで Next 側の値に上書きされるため、
  // 最後に走るここで確実に付ける。
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, max-age=0, private");
  return response;
}

export const config = {
  matcher: ["/work", "/work/:path*"],
};
