import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "くわらぼ",
  description: "クワガタのブリード・飼育管理アプリ",
  appleWebApp: {
    capable: true,
    title: "くわらぼ",
    statusBarStyle: "default",
  },
};

export default function KuwagataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
