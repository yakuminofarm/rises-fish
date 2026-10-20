import type { Metadata } from "next";
import { HydrationGate } from "@/anken/components/HydrationGate";
import "./anken.css";

export const metadata: Metadata = {
  title: "案件ボード（試作）",
  description: "営業企画課の案件・タスク管理アプリの試作版",
};

export default function AnkenLayout({ children }: { children: React.ReactNode }) {
  return <HydrationGate>{children}</HydrationGate>;
}
