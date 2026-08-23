export type Gender = "male" | "female" | "unknown";

export type KuwagataSpecies =
  | "オオクワガタ"
  | "ヒラタクワガタ"
  | "コクワガタ"
  | "ノコギリクワガタ"
  | "ミヤマクワガタ"
  | "パラワンオオヒラタ"
  | "スマトラオオヒラタ"
  | "アンタエウスオオクワガタ"
  | "ギラファノコギリクワガタ"
  | "ニジイロクワガタ"
  | "タランドゥスオオツヤクワガタ"
  | "オウゴンオニクワガタ"
  | "その他";

/** 成虫個体 */
export interface Beetle {
  id: string;
  code: string;            // 管理番号 (例: 26OK-A1)
  name?: string;           // 愛称
  species: KuwagataSpecies | string;
  locality?: string;       // 産地 (例: 山梨県韮崎、スマトラ アチェ)
  generation?: string;     // 累代 (例: WD, WF1, CBF2, F5)
  gender: Gender;
  sizeMm?: number;         // 体長 (mm)
  emergedDate?: string;    // 羽化日
  acquiredDate: string;    // 入手日
  matured?: boolean;       // 後食済み (ブリード可能な成熟状態)
  sourceLineId?: string;   // 出身ブリードライン
  isAlive: boolean;
  isFavorite?: boolean;
  notes: string;
}

/** ブリードラインの進行状況 */
export type LineStatus =
  | "pairing"        // ペアリング中
  | "laying"         // 産卵セット中
  | "waiting_split"  // 割り出し待ち
  | "split_done"     // 割り出し済み
  | "finished";      // 終了

/** ブリードライン (ペアリング〜産卵セット〜割り出しの1サイクル) */
export interface BreedingLine {
  id: string;
  name: string;            // ライン名 (例: 2026-A)
  species: KuwagataSpecies | string;
  maleId?: string;
  femaleId?: string;
  pairingDate?: string;    // ペアリング開始日
  setDate?: string;        // 産卵セット投入日
  setType?: string;        // セット内容 (産卵材/発酵マット/カワラ材/菌床)
  splitDate?: string;      // 割り出し日
  eggCount?: number;       // 採卵数
  larvaCount?: number;     // 割り出し幼虫数
  status: LineStatus;
  notes: string;
}

/** 幼虫の成長ステージ */
export type LarvaStage = "egg" | "L1" | "L2" | "L3" | "pupa" | "adult";

/** ビン交換 (菌糸ビン・マット交換) の記録 */
export interface BottleChange {
  id: string;
  date: string;
  bottleType: string;      // 菌糸ビン / 発酵マット / カワラ菌糸 など
  bottleSize?: string;     // 800cc, 1400cc など
  weightG?: number;        // 交換時体重 (g)
  memo?: string;
}

/** 幼虫個体 */
export interface Larva {
  id: string;
  code: string;            // 管理番号 (例: 2026-A-01)
  lineId?: string;         // 出身ライン
  species: KuwagataSpecies | string;
  stage: LarvaStage;
  gender: Gender;          // 雌雄判別結果
  hatchDate?: string;      // 孵化日 (または割り出し日)
  bottleChanges: BottleChange[];
  pupaDate?: string;       // 蛹化日
  emergedDate?: string;    // 羽化日
  emergedSizeMm?: number;  // 羽化サイズ (mm)
  isAlive: boolean;
  notes: string;
}
