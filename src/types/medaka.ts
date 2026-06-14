export type Gender = "male" | "female" | "unknown";

export type MedakaVariety =
  | "幹之"
  | "楊貴妃"
  | "三色"
  | "黒メダカ"
  | "白メダカ"
  | "青メダカ"
  | "みゆき"
  | "オロチ"
  | "紅帝"
  | "煌"
  | "サファイア"
  | "夜桜"
  | "その他";

export interface Medaka {
  id: string;
  name: string;
  variety: MedakaVariety | string;
  gender: Gender;
  birthDate?: string;
  acquiredDate: string;
  parentIds?: {
    father?: string;
    mother?: string;
  };
  childIds?: string[];
  photos: MedakaPhoto[];
  traits: MedakaTrait[];
  notes: string;
  isAlive: boolean;
  generation?: number;
}

export interface MedakaPhoto {
  id: string;
  url: string;
  takenAt: string;
  label?: string;
}

export interface MedakaTrait {
  name: string;
  value: string | number;
  unit?: string;
  recordedAt: string;
}

export interface BreedingRecord {
  id: string;
  fatherId: string;
  motherId: string;
  breedingDate: string;
  expectedHatchDate?: string;
  actualHatchDate?: string;
  eggCount?: number;
  hatchCount?: number;
  offspringIds: string[];
  notes: string;
  success?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url?: string;
  imageUrl?: string;
  category: "品種" | "飼育" | "イベント" | "商品" | "ニュース";
  publishedAt: string;
  source: string;
}

export interface Breeder {
  id: string;
  name: string;
  handle: string;
  specialty: string;       // 得意品種
  location: string;        // 活動地域
  bio: string;
  avatarColor: string;     // アバター背景色
  avatarEmoji: string;     // アバター絵文字
  followersK?: number;     // フォロワー数（千単位）
  awards?: string[];
}

export interface ColumnArticle {
  id: string;
  title: string;
  lead: string;            // リード文
  body: string[];          // 段落配列
  imageUrl?: string;
  category: "品種改良" | "繁殖技術" | "水質管理" | "飼育環境" | "品評会";
  publishedAt: string;
  readMinutes: number;
  breeder: Breeder;
  featuredVariety?: string;
  tags: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "餌" | "水槽" | "フィルター" | "薬品" | "産卵グッズ" | "その他";
  price?: number;
  rating?: number;
  description: string;
  imageUrl?: string;
  affiliateUrl?: string;
  tags: string[];
}

export interface AppTab {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}
