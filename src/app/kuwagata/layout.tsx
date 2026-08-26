import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "くわらぼ",
  description: "クワガタのブリード・飼育管理アプリ",
  // ルート直下の manifest はめだか手帳と共用になってしまうので、
  // このルート専用のものを public/ に置いて指す
  manifest: "/kuwagata/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "くわらぼ",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ead9bd",
  // ホーム画面から開いたときにノッチ下まで地色を回す
  viewportFit: "cover",
};

export default function KuwagataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
