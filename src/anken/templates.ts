import type { Category, Priority, RequestSource, StepSide, TaskStatus } from "./types";

export const CATEGORIES: Record<Category, { label: string; short: string }> = {
  promo: { label: "販促物", short: "販促" },
  service: { label: "新サービス", short: "新サービス" },
  web: { label: "LP・ショップ", short: "LP・ショップ" },
};

export const CATEGORY_ORDER: Category[] = ["promo", "service", "web"];

export interface TemplateStep {
  name: string;
  side: StepSide;
  /** 案件の納期の何日前が期日か（マイナスは納期の後） */
  before: number;
}

// 工程名と日数はたたき台。設定画面から編集できるようにするのは STEP 1 以降
export const TEMPLATES: Record<Category, TemplateStep[]> = {
  promo: [
    { name: "企画・要件", side: "us", before: 30 },
    { name: "デザイン（外注先）", side: "vendor", before: 21 },
    { name: "社内クライアント校正", side: "client", before: 14 },
    { name: "入稿", side: "us", before: 10 },
    { name: "印刷・納品（外注先）", side: "vendor", before: 0 },
  ],
  service: [
    { name: "構想", side: "us", before: 75 },
    { name: "市場・顧客調査", side: "us", before: 60 },
    { name: "社内クライアント・上長承認", side: "client", before: 50 },
    { name: "準備", side: "us", before: 25 },
    { name: "テスト販売", side: "us", before: 10 },
    { name: "本リリース", side: "us", before: 0 },
  ],
  web: [
    { name: "要件整理", side: "us", before: 25 },
    { name: "構成・原稿", side: "us", before: 20 },
    { name: "デザイン", side: "us", before: 14 },
    { name: "実装（自社）", side: "us", before: 7 },
    { name: "社内クライアント確認", side: "client", before: 3 },
    { name: "公開", side: "us", before: 0 },
    { name: "効果測定", side: "us", before: -14 },
  ],
};

export const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "未着手" },
  { id: "doing", label: "進行中" },
  { id: "review", label: "課内確認" },
  { id: "waiting", label: "クライアント・外注待ち" },
  { id: "done", label: "完了" },
];

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label])) as Record<
  TaskStatus,
  string
>;

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "both", label: "急ぎ・重要" },
  { id: "important", label: "重要" },
  { id: "urgent", label: "急ぎ" },
  { id: "neither", label: "どちらでもない" },
];

export const SOURCE_LABEL: Record<RequestSource, string> = {
  form: "依頼フォーム",
  mail: "メール転送",
  chatwork: "Chatwork",
  line: "LINE",
  memo: "メモ",
};

/** 待ち日数がこれ以上で赤くする */
export const WAIT_ALERT_DAYS = 3;
