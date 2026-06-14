// ──────────────────────────────────────────────────────────
// めだか手帳 — 品種設計 静的遺伝データベース
// 出典: NBRP Medaka / 日本メダカ協会 / ブリーダー文献
// ──────────────────────────────────────────────────────────

export type InheritanceType =
  | "dominant"           // 優性
  | "recessive"          // 劣性
  | "incomplete_dominant"// 不完全優性
  | "polygenic"          // 多遺伝子（量的形質）
  | "temperature_sensitive"; // 温度感受性

export type TraitLevel = "none" | "weak" | "medium" | "strong" | "max";
export type Difficulty = "★" | "★★" | "★★★" | "★★★★";

export interface TraitDefinition {
  id: string;
  label: string;
  inheritance: InheritanceType;
  inheritanceLabel: string;
  inheritanceNote: string;
  color: string; // UIアクセントカラー
}

export interface VarietyTrait {
  traitId: string;
  level: TraitLevel;
  note?: string;
}

export interface RecommendedCross {
  fatherVariety: string;
  motherVariety: string;
  targetProbability: number; // 目標形質が出る確率(%)
  offspringNote: string;     // 出現形質の説明
  generationsToFix: number;  // 固定まで何世代か
}

export interface GenerationStep {
  generation: "P" | "F1" | "F2" | "F3" | "F4";
  label: string;
  description: string;
  selectionCriteria: string[];
  expectedRatio?: string; // 例: "1/4 が目標形質"
}

export interface VarietyDesignProfile {
  variety: string;
  nickname: string;       // キャッチコピー
  difficulty: Difficulty;
  difficultyNote: string;
  generationsNeeded: number;
  traits: VarietyTrait[];
  recommendedCrosses: RecommendedCross[];
  roadmap: GenerationStep[];
  tips: string[];
}

// ──────────────────────────────────────────────────────────
// 形質マスタ
// ──────────────────────────────────────────────────────────
export const TRAIT_DEFINITIONS: TraitDefinition[] = [
  {
    id: "body_light",
    label: "体外光",
    inheritance: "incomplete_dominant",
    inheritanceLabel: "不完全優性",
    inheritanceNote: "光あり同士の掛け合わせでより強い光が出やすい。両親ともフルボディが理想。",
    color: "#06b6d4",
  },
  {
    id: "inner_light",
    label: "体内光",
    inheritance: "recessive",
    inheritanceLabel: "劣性",
    inheritanceNote: "両親から劣性遺伝子を受け取った個体にのみ発現。固定には複数世代が必要。",
    color: "#8b5cf6",
  },
  {
    id: "orange_color",
    label: "橙色発色",
    inheritance: "polygenic",
    inheritanceLabel: "多遺伝子",
    inheritanceNote: "複数の遺伝子が関与。発色が濃い個体同士を選び続けることで世代を経て向上する。",
    color: "#f97316",
  },
  {
    id: "red_color",
    label: "赤色発色",
    inheritance: "polygenic",
    inheritanceLabel: "多遺伝子",
    inheritanceNote: "橙色発色の極端な強化版。累代選別が鍵。",
    color: "#ef4444",
  },
  {
    id: "blue_color",
    label: "青色発色",
    inheritance: "incomplete_dominant",
    inheritanceLabel: "不完全優性",
    inheritanceNote: "青系同士で掛け合わせると深い青が安定しやすい。",
    color: "#3b82f6",
  },
  {
    id: "black_color",
    label: "黒色発色",
    inheritance: "recessive",
    inheritanceLabel: "劣性",
    inheritanceNote: "オロチ等の黒色は劣性。黒色個体同士でないと子に出にくい。",
    color: "#1f2937",
  },
  {
    id: "tricolor",
    label: "三色模様",
    inheritance: "polygenic",
    inheritanceLabel: "多遺伝子",
    inheritanceNote: "白・橙・黒の3色が複数遺伝子の組み合わせで発現。出現率が低く固定難。",
    color: "#d946ef",
  },
  {
    id: "pink_color",
    label: "ピンク発色",
    inheritance: "polygenic",
    inheritanceLabel: "多遺伝子",
    inheritanceNote: "橙と青の中間的な発色。夜桜に特有。遮光管理で発色が左右される。",
    color: "#ec4899",
  },
  {
    id: "body_shape",
    label: "ヒカリ体型",
    inheritance: "recessive",
    inheritanceLabel: "劣性",
    inheritanceNote: "背びれが腹側にもある体型。両親からの劣性遺伝子が必要。",
    color: "#10b981",
  },
  {
    id: "daruma",
    label: "ダルマ体型",
    inheritance: "temperature_sensitive",
    inheritanceLabel: "温度感受性劣性",
    inheritanceNote: "高水温（28℃以上）下での孵化でダルマ率が上がる。遺伝子＋環境の両方が関与。",
    color: "#f59e0b",
  },
];

// ──────────────────────────────────────────────────────────
// 品種設計プロファイル
// ──────────────────────────────────────────────────────────
export const VARIETY_DESIGN_PROFILES: VarietyDesignProfile[] = [
  // ─────────────────────────────
  // 幹之
  // ─────────────────────────────
  {
    variety: "幹之",
    nickname: "体外光の王道",
    difficulty: "★★★",
    difficultyNote: "フルボディ固定は難しいが、体外光自体は出やすい",
    generationsNeeded: 3,
    traits: [
      { traitId: "body_light", level: "max", note: "体外光の代表品種。フルボディが最高峰。" },
      { traitId: "blue_color", level: "medium", note: "シルバーブルーの輝き" },
      { traitId: "orange_color", level: "none" },
      { traitId: "tricolor", level: "none" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "幹之",
        motherVariety: "幹之",
        targetProbability: 75,
        offspringNote: "体外光を持つ個体が高確率で出現。フルボディ同士なら次世代でも高光量が期待できる。",
        generationsToFix: 3,
      },
      {
        fatherVariety: "みゆき",
        motherVariety: "幹之",
        targetProbability: 60,
        offspringNote: "みゆきの形質を取り込みつつ体外光を強化する王道ルート。",
        generationsToFix: 2,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 基礎個体選定",
        description: "体外光がフルボディ以上の個体を両親に選ぶ。光の起点が背びれ付近かを必ず確認。",
        selectionCriteria: [
          "上見・横見でともに光が途切れない",
          "体外光の起点が背びれ付近にある",
          "体側の輝きが均一",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 光あり個体を選別",
        description: "F1の約75%に体外光が発現する。光の面積が広い上位個体を次世代親に残す。",
        selectionCriteria: [
          "体外光の面積が両親以上の個体を選ぶ",
          "孵化後60〜90日に強光環境下で選別",
          "光なし個体は別管理",
        ],
        expectedRatio: "約75%に体外光あり",
      },
      {
        generation: "F2",
        label: "F2 — フルボディ固定へ",
        description: "F1優良個体同士の掛け合わせ。フルボディ個体が増加し始める世代。",
        selectionCriteria: [
          "頭部まで光が届いている個体を最優先",
          "光質（ギラつきより滑らかな光）を重視",
          "体型・発色のバランスも確認",
        ],
        expectedRatio: "フルボディ: 約20〜40%",
      },
      {
        generation: "F3",
        label: "F3 — 形質固定・完成",
        description: "この世代でフルボディが高確率で出れば固定成功。以降は維持繁殖へ。",
        selectionCriteria: [
          "フルボディ同士での近親交配で固定率確認",
          "光の退色個体を除去",
          "品評会基準に照らして選別",
        ],
        expectedRatio: "フルボディ: 50〜70%以上で固定とみなす",
      },
    ],
    tips: [
      "選別は孵化後60〜90日が最適。この時期の強光照射で発現が安定する。",
      "上見だけでなく横見での確認を怠らないこと。上見良好でも横見で光弱い個体は固定率が低い。",
      "光の「面積」より「質」を重視。ギラついた光より滑らかな体外光の個体が次世代でも安定する。",
    ],
  },

  // ─────────────────────────────
  // 楊貴妃
  // ─────────────────────────────
  {
    variety: "楊貴妃",
    nickname: "橙色の女王",
    difficulty: "★★",
    difficultyNote: "発色個体を選び続ければ着実に濃くなる。初心者向き。",
    generationsNeeded: 2,
    traits: [
      { traitId: "orange_color", level: "max", note: "深い橙色が特徴。遺伝率は高い。" },
      { traitId: "body_light", level: "none" },
      { traitId: "red_color", level: "weak", note: "深橙〜浅赤の個体も出る" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "楊貴妃",
        motherVariety: "楊貴妃",
        targetProbability: 85,
        offspringNote: "発色が濃い個体同士を選べば累代で深みが増す。最も安定したルート。",
        generationsToFix: 2,
      },
      {
        fatherVariety: "紅帝",
        motherVariety: "楊貴妃",
        targetProbability: 50,
        offspringNote: "紅帝の赤みと楊貴妃の橙が混ざり、中間〜深橙が多数出る。赤系強化に。",
        generationsToFix: 3,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 発色最強個体を選定",
        description: "体色が最も濃いオレンジの個体を両親に。白っぽい個体は除外。",
        selectionCriteria: [
          "体色スコアが高い（発色の深さを数値化して管理）",
          "背びれ・尾びれまで色が乗っている",
          "腹部の色も確認（白抜けがない）",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 発色上位を選ぶ",
        description: "多遺伝子なので発色は連続分布する。上位25〜30%だけを次世代親に残す。",
        selectionCriteria: [
          "上位30%の発色個体を残す",
          "色の均一性を重視（ムラのない個体を優先）",
        ],
        expectedRatio: "発色強: 約50〜60%",
      },
      {
        generation: "F2",
        label: "F2 — 発色固定・完成",
        description: "親より濃い個体が出始める。品評会グレードへ近づく世代。",
        selectionCriteria: [
          "親越えの発色個体を最優先で残す",
          "ヒレの発色も確認（透明でないもの）",
        ],
        expectedRatio: "最深色グレード: 約20〜40%",
      },
    ],
    tips: [
      "遮光は逆効果。楊貴妃は直射日光でカロテノイド色素が活性化するため、明るい環境で育てる。",
      "餌にアスタキサンチン配合のものを使うと発色がさらに向上する。",
      "水温25〜28℃が発色に最も好影響。低水温では色が出にくい。",
    ],
  },

  // ─────────────────────────────
  // 紅帝
  // ─────────────────────────────
  {
    variety: "紅帝",
    nickname: "深紅の極致",
    difficulty: "★★★",
    difficultyNote: "楊貴妃の延長線上だが、深紅固定には根気が必要",
    generationsNeeded: 4,
    traits: [
      { traitId: "red_color", level: "max", note: "鮮血のような深紅が最大の特徴" },
      { traitId: "orange_color", level: "strong" },
      { traitId: "body_light", level: "none" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "紅帝",
        motherVariety: "紅帝",
        targetProbability: 70,
        offspringNote: "深紅同士で固定率が上がる。最高グレード個体を絶やさないことが重要。",
        generationsToFix: 4,
      },
      {
        fatherVariety: "楊貴妃",
        motherVariety: "紅帝",
        targetProbability: 40,
        offspringNote: "楊貴妃の量産性と紅帝の発色を組み合わせる。赤み強化のベースとして有効。",
        generationsToFix: 3,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 最深色個体の入手",
        description: "信頼できるブリーダーから最高グレードの深紅個体を入手することが成功の近道。",
        selectionCriteria: [
          "ヒレ先まで赤みが乗っている",
          "体側の白抜けがない",
          "光沢感のある赤（くすんだ赤は除外）",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 赤み強個体を選別",
        description: "発色は親より薄い傾向があるが、赤み強い上位個体が次世代への礎になる。",
        selectionCriteria: [
          "橙より赤みが強い個体を最優先",
          "ヒレの赤みも重要な選別基準",
        ],
        expectedRatio: "深紅グレード: 約30%",
      },
      {
        generation: "F2",
        label: "F2 — 赤系分離の活用",
        description: "この世代から深紅に近い個体が増える。しっかり選別し続ける。",
        selectionCriteria: [
          "親を超える赤みの個体を発見したら最優先",
          "体全体の色ムラをチェック",
        ],
        expectedRatio: "深紅グレード: 約40〜50%",
      },
      {
        generation: "F3",
        label: "F3以降 — 固定と維持",
        description: "累代選別により深紅が安定してくる。固定後は維持繁殖で品質をキープ。",
        selectionCriteria: [
          "常に上位20%の発色個体のみを親に残す",
          "色が薄い個体は外す",
        ],
        expectedRatio: "深紅グレード: 60〜70%以上で固定成功",
      },
    ],
    tips: [
      "紅帝の深紅はカロテノイド系色素が主体。アスタキサンチン強化餌の使用が効果的。",
      "水換え頻度を上げ水質を清潔に保つことで発色が向上する。",
      "低温（20℃以下）になると色が飛ぶ。冬場の加温管理が重要。",
    ],
  },

  // ─────────────────────────────
  // 夜桜
  // ─────────────────────────────
  {
    variety: "夜桜",
    nickname: "幻想のピンク",
    difficulty: "★★★",
    difficultyNote: "幹之×楊貴妃の交雑に由来。形質の分離が大きく選別眼が問われる",
    generationsNeeded: 3,
    traits: [
      { traitId: "pink_color", level: "strong", note: "ピンク〜紫の幻想的な発色" },
      { traitId: "body_light", level: "medium", note: "体外光を持つ個体もいる" },
      { traitId: "orange_color", level: "weak" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "幹之",
        motherVariety: "楊貴妃",
        targetProbability: 30,
        offspringNote: "王道ルート。F1では夜桜的な個体が約30%出現。F2で選別強化。",
        generationsToFix: 3,
      },
      {
        fatherVariety: "夜桜",
        motherVariety: "夜桜",
        targetProbability: 60,
        offspringNote: "固定個体同士ならより安定。ピンク発色と体外光のバランスが鍵。",
        generationsToFix: 2,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 幹之♂ × 楊貴妃♀",
        description: "体外光強の幹之♂と発色強の楊貴妃♀を組み合わせる。両者の品質が夜桜の出来を左右する。",
        selectionCriteria: [
          "幹之: フルボディ以上の体外光",
          "楊貴妃: 発色スコア最高グレード",
        ],
      },
      {
        generation: "F1",
        label: "F1 — ピンク・紫発色個体を発見",
        description: "F1の多くは中間形質（橙×光）だが、ピンク〜紫味のある個体が夜桜の候補。",
        selectionCriteria: [
          "体色にピンク・紫みがある個体を選別",
          "体外光も残っている個体が理想",
          "純橙・純幹之タイプは別系統として管理",
        ],
        expectedRatio: "夜桜型: 約20〜35%",
      },
      {
        generation: "F2",
        label: "F2 — 夜桜型を固定へ",
        description: "F1夜桜型個体同士を掛け合わせる。ピンク発色＋体外光の両立個体が増加。",
        selectionCriteria: [
          "ピンク発色と体外光が共存する個体最優先",
          "遮光65〜70%の環境で飼育し発色を引き出す",
          "朝2時間だけ直射日光を当てる管理も有効",
        ],
        expectedRatio: "夜桜型固定: 約40〜60%",
      },
      {
        generation: "F3",
        label: "F3 — 完成・維持",
        description: "安定した夜桜が出るようになる。以降は維持繁殖で品質をキープ。",
        selectionCriteria: [
          "発色と体外光バランス最良の個体を親に",
          "くすんだ発色の個体は除去",
        ],
      },
    ],
    tips: [
      "遮光65〜70%が夜桜の発色を最大化する。直射日光は朝2時間程度に留める。",
      "水温26〜28℃をキープ。低温では発色が遅れる。",
      "F1では多様な表現型が出る。焦らず複数個体を確保し選別幅を広げること。",
    ],
  },

  // ─────────────────────────────
  // サファイア
  // ─────────────────────────────
  {
    variety: "サファイア",
    nickname: "コバルトの深海",
    difficulty: "★★★",
    difficultyNote: "深い青色の固定は難しく、選別眼が問われる",
    generationsNeeded: 3,
    traits: [
      { traitId: "blue_color", level: "max", note: "深いコバルトブルーが特徴" },
      { traitId: "body_light", level: "medium" },
      { traitId: "orange_color", level: "none" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "サファイア",
        motherVariety: "サファイア",
        targetProbability: 65,
        offspringNote: "青系同士で深青が安定しやすい。体外光も同時に維持できる。",
        generationsToFix: 3,
      },
      {
        fatherVariety: "幹之",
        motherVariety: "サファイア",
        targetProbability: 40,
        offspringNote: "幹之の体外光とサファイアの青色を組み合わせる発展ルート。",
        generationsToFix: 3,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 深青個体を選定",
        description: "青色の深み・均一性が高い個体を両親に。体外光も持つ個体が理想。",
        selectionCriteria: [
          "全身に均一な青色発色",
          "ヒレまで青みが乗っている",
          "体外光があれば加点",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 青系個体を選別",
        description: "青色強度で上位個体を選ぶ。薄青〜深青の連続分布が見られる。",
        selectionCriteria: [
          "最も深い青色の個体を30%程度残す",
          "青みが均一な個体を優先",
        ],
        expectedRatio: "青系: 約60〜70%",
      },
      {
        generation: "F2",
        label: "F2 — 深青固定",
        description: "累代選別により深青が安定する。親を超える個体が出始める。",
        selectionCriteria: [
          "親越えの深青個体を最優先",
          "光沢感のある青が理想",
        ],
        expectedRatio: "深青グレード: 約40〜55%",
      },
    ],
    tips: [
      "黒い容器での飼育・観察が青色発色の確認に有効。白容器では色が飛んで見える。",
      "水温25〜27℃が青色発色に最適。高温すぎると色が薄くなる傾向がある。",
      "照明の色温度も発色に影響する。青白い光よりも太陽光に近い光源を使う。",
    ],
  },

  // ─────────────────────────────
  // 三色
  // ─────────────────────────────
  {
    variety: "三色",
    nickname: "偶然が生む芸術",
    difficulty: "★★★★",
    difficultyNote: "3色の出現・バランス固定は最難関クラス。長期戦覚悟で",
    generationsNeeded: 5,
    traits: [
      { traitId: "tricolor", level: "max", note: "白・橙・黒が理想的バランスで出ることが目標" },
      { traitId: "orange_color", level: "medium" },
      { traitId: "black_color", level: "medium" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "楊貴妃",
        motherVariety: "白メダカ",
        targetProbability: 15,
        offspringNote: "白と橙のベースを作る入門ルート。三色出現率は低いが基礎固めに。",
        generationsToFix: 5,
      },
      {
        fatherVariety: "三色",
        motherVariety: "三色",
        targetProbability: 40,
        offspringNote: "既に三色が固定されていれば維持繁殖で40%程度が三色で出る。",
        generationsToFix: 3,
      },
      {
        fatherVariety: "サファイア",
        motherVariety: "紅帝",
        targetProbability: 10,
        offspringNote: "青・赤の異系交配。三色とは異なる美しい変異体が多数出現する発展ルート。",
        generationsToFix: 5,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 白・橙・黒の素地個体を集める",
        description: "三色は複数の色素遺伝子が関与。それぞれの色素を持つ系統を揃えることが出発点。",
        selectionCriteria: [
          "白色の地色が明確な個体（白メダカ系）",
          "橙色発色の強い楊貴妃系",
          "黒色素を持つ系統（黒メダカ、オロチ等）",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 多様な表現型から三色候補を探す",
        description: "F1では多様な個体が出現。白・橙・黒の3色が同一個体に見られるものを宝として保護。",
        selectionCriteria: [
          "3色が体に乗っている個体を全て残す",
          "2色個体も次世代用に一部キープ",
          "色の境界がクッキリしている個体を優先",
        ],
        expectedRatio: "三色出現: 5〜20%",
      },
      {
        generation: "F2",
        label: "F2 — 三色同士での掛け合わせ",
        description: "F1三色個体同士を組み合わせる。三色率が向上し、バランスの取れた個体が出始める。",
        selectionCriteria: [
          "3色の面積バランスが良い個体を最優先",
          "白地が多め（7割以上）が品評会では評価高い",
          "黒斑の位置・形状も選別基準に",
        ],
        expectedRatio: "三色出現: 25〜40%",
      },
      {
        generation: "F3",
        label: "F3〜F4 — バランス固定",
        description: "三色のバランスが固定され始める段階。品評会基準の個体が出るようになる。",
        selectionCriteria: [
          "白:橙:黒 = 6:3:1 前後が理想",
          "黒斑が散らばらず集中している個体を優先",
          "ヒレへの発色も確認",
        ],
        expectedRatio: "高品質三色: 20〜35%",
      },
    ],
    tips: [
      "三色の固定は長期戦。5年以上のプロジェクトとして計画を立てること。",
      "黒斑の出方は個体差が大きい。複数系統を並行して維持すると選別幅が広がる。",
      "水質変化（水換え）が黒斑の増減に影響することがある。環境を安定させて観察を。",
    ],
  },

  // ─────────────────────────────
  // 煌
  // ─────────────────────────────
  {
    variety: "煌",
    nickname: "体内外光の融合",
    difficulty: "★★★★",
    difficultyNote: "体外光＋体内光の両立固定は最高難度クラス",
    generationsNeeded: 4,
    traits: [
      { traitId: "body_light", level: "strong" },
      { traitId: "inner_light", level: "strong", note: "体内光が煌の最大の特徴" },
      { traitId: "blue_color", level: "medium" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "幹之",
        motherVariety: "煌",
        targetProbability: 25,
        offspringNote: "幹之の体外光と煌の体内光を組み合わせる。両立個体の出現率は低いが品質が高い。",
        generationsToFix: 4,
      },
      {
        fatherVariety: "煌",
        motherVariety: "煌",
        targetProbability: 50,
        offspringNote: "固定個体同士なら体内光・体外光の両方が出やすい。",
        generationsToFix: 3,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — 体内光・体外光両持ち個体を選定",
        description: "体内光（腹側から見える光）と体外光の両方を持つ個体を親に選ぶ。片方だけの個体は避ける。",
        selectionCriteria: [
          "体内光の確認は暗所で光源を下から当てて行う",
          "体外光もフルボディ以上が理想",
          "光の色が金〜白金のもの",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 両光タイプを選別",
        description: "F1では体外光のみ・体内光のみ・両方・なしの4タイプが出る。両方を持つ個体を保護。",
        selectionCriteria: [
          "体内光＋体外光の両立個体を全て残す",
          "体内光のみ個体も次世代用にキープ",
        ],
        expectedRatio: "両光: 約15〜25%",
      },
      {
        generation: "F2",
        label: "F2 — 両光固定へ",
        description: "F1両光個体同士の交配。両光の出現率が上がる世代。",
        selectionCriteria: [
          "両光の強度が高い個体を選ぶ",
          "体内光の色（金色度）も選別基準に",
        ],
        expectedRatio: "両光: 約35〜50%",
      },
      {
        generation: "F3",
        label: "F3 — 完成形へ",
        description: "煌の完成形（体外光フルボディ＋金体内光）が安定して出るようになる。",
        selectionCriteria: [
          "光の強度・色・範囲すべてが高水準の個体を親に",
        ],
        expectedRatio: "高品質煌: 40〜60%",
      },
    ],
    tips: [
      "体内光の確認には暗い部屋でスマートフォンのライトを腹側から当てる方法が有効。",
      "体内光は低水温で発現しにくい。水温25℃以上を維持すること。",
      "体外光と体内光は遺伝的に独立している部分があるため、両立固定には根気が必要。",
    ],
  },

  // ─────────────────────────────
  // オロチ
  // ─────────────────────────────
  {
    variety: "オロチ",
    nickname: "漆黒の支配者",
    difficulty: "★★",
    difficultyNote: "黒色固定自体は比較的容易。黒色の深みを競う段階が本番。",
    generationsNeeded: 2,
    traits: [
      { traitId: "black_color", level: "max", note: "全身・目・ヒレまで黒の純黒個体が最高峰" },
      { traitId: "orange_color", level: "none" },
      { traitId: "body_light", level: "none" },
    ],
    recommendedCrosses: [
      {
        fatherVariety: "オロチ",
        motherVariety: "オロチ",
        targetProbability: 90,
        offspringNote: "純オロチ同士なら全黒個体が高確率で出る。黒の深みを競う選別が中心。",
        generationsToFix: 2,
      },
      {
        fatherVariety: "黒メダカ",
        motherVariety: "オロチ",
        targetProbability: 50,
        offspringNote: "黒メダカの遺伝子でオロチの暗色度を強化するルート。",
        generationsToFix: 3,
      },
    ],
    roadmap: [
      {
        generation: "P",
        label: "親世代 — ピュアブラック個体を選定",
        description: "目・ヒレ・腹まで全て黒いピュアブラック個体を選ぶ。白っぽい腹の個体は除外。",
        selectionCriteria: [
          "目（虹彩）が黒い個体を優先",
          "腹部に白・橙がない",
          "ヒレの縁まで黒い",
        ],
      },
      {
        generation: "F1",
        label: "F1 — 黒度の選別",
        description: "ほぼ全個体が黒系で出るが、黒の深みに差がある。最も暗い個体を残す。",
        selectionCriteria: [
          "腹を含む全身が均一な黒",
          "光に当てても色が飛ばない（深みのある黒）",
        ],
        expectedRatio: "黒系: 約85〜90%",
      },
      {
        generation: "F2",
        label: "F2 — 完成・維持",
        description: "ピュアブラックが安定して出る。維持繁殖フェーズへ。",
        selectionCriteria: [
          "黒色の品質を落とさない選別を継続",
          "他品種との混雑を避け血統を純化",
        ],
        expectedRatio: "ピュアブラック: 70〜80%",
      },
    ],
    tips: [
      "白・透明容器での飼育が黒色発現を促進する（保護色反応）。",
      "黒色は遺伝的に安定しているが、色が薄い個体を混ぜると数世代で薄まる。",
      "他品種との交雑は極力避けること。オロチ血統の純化を最優先に。",
    ],
  },
];

// ──────────────────────────────────────────────────────────
// ユーティリティ
// ──────────────────────────────────────────────────────────

export function getDesignProfile(variety: string): VarietyDesignProfile | undefined {
  return VARIETY_DESIGN_PROFILES.find((p) => p.variety === variety);
}

export function getTraitDefinition(traitId: string): TraitDefinition | undefined {
  return TRAIT_DEFINITIONS.find((t) => t.id === traitId);
}

export const TRAIT_LEVEL_LABELS: Record<TraitLevel, string> = {
  none:   "なし",
  weak:   "弱",
  medium: "中",
  strong: "強",
  max:    "最強",
};

export const TRAIT_LEVEL_WIDTH: Record<TraitLevel, string> = {
  none:   "0%",
  weak:   "25%",
  medium: "50%",
  strong: "75%",
  max:    "100%",
};

export const INHERITANCE_BADGE: Record<InheritanceType, { label: string; color: string }> = {
  dominant:             { label: "優性", color: "#3b82f6" },
  recessive:            { label: "劣性", color: "#6b7280" },
  incomplete_dominant:  { label: "不完全優性", color: "#8b5cf6" },
  polygenic:            { label: "多遺伝子", color: "#f97316" },
  temperature_sensitive:{ label: "温度感受性", color: "#f59e0b" },
};
