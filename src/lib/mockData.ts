import { Medaka, NewsItem, Product } from "@/types/medaka";

export const mockMedakas: Medaka[] = [
  {
    id: "m1",
    name: "幹之1号",
    variety: "幹之",
    gender: "male",
    acquiredDate: "2024-04-01",
    birthDate: "2024-03-15",
    photos: [],
    traits: [
      { name: "体長", value: 3.2, unit: "cm", recordedAt: "2024-06-01" },
      { name: "光沢スコア", value: 8, recordedAt: "2024-06-01" },
    ],
    notes: "体外光が強く出ている個体",
    isAlive: true,
    generation: 1,
  },
  {
    id: "m2",
    name: "楊貴妃♀A",
    variety: "楊貴妃",
    gender: "female",
    acquiredDate: "2024-04-01",
    birthDate: "2024-03-10",
    photos: [],
    traits: [
      { name: "体長", value: 3.5, unit: "cm", recordedAt: "2024-06-01" },
      { name: "発色スコア", value: 9, recordedAt: "2024-06-01" },
    ],
    notes: "橙色発色が非常に強い",
    isAlive: true,
    generation: 1,
  },
  {
    id: "m3",
    name: "F1-夜桜1",
    variety: "夜桜",
    gender: "unknown",
    acquiredDate: "2024-07-01",
    birthDate: "2024-06-20",
    parentIds: { father: "m1", mother: "m2" },
    photos: [],
    traits: [],
    notes: "F1世代・成長中",
    isAlive: true,
    generation: 2,
  },
];

export const mockNews: NewsItem[] = [
  {
    id: "n1",
    title: "2024年注目の新品種「煌メダカ」の飼育ポイント",
    summary:
      "体外光と体内光を併せ持つ幻想的な品種「煌」。繁殖難易度が高いが、その美しさから人気急上昇中。水温管理と遮光がカギ。",
    category: "品種",
    publishedAt: "2024-06-10",
    source: "メダカ品種図鑑",
  },
  {
    id: "n2",
    title: "夏の水温対策｜メダカを猛暑から守る5つの方法",
    summary:
      "35℃を超える水温はメダカに致命的。すだれや遮光ネット、水換えのタイミングなど実践的な対策をまとめました。",
    category: "飼育",
    publishedAt: "2024-06-08",
    source: "めだか本舗",
  },
  {
    id: "n3",
    title: "秋の品評会2024｜全国メダカ品評会エントリー開始",
    summary:
      "今年も全国規模のメダカ品評会が開催。幹之部門・三色部門・新品種部門など計8カテゴリーで競います。",
    category: "イベント",
    publishedAt: "2024-06-05",
    source: "日本メダカ協会",
  },
  {
    id: "n4",
    title: "産卵床の新素材「モスカーテン」が話題に",
    summary:
      "ジャワモスを模した人工産卵床が飼育者の間でヒット。卵の回収率が従来比1.5倍という報告も。",
    category: "商品",
    publishedAt: "2024-06-01",
    source: "アクアリウムジャーナル",
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "メダカの舞 産卵・育成用",
    brand: "キョーリン",
    category: "餌",
    price: 680,
    rating: 4.5,
    description:
      "産卵期のメダカに最適な栄養バランス。ビタミンEとカルシウムを強化配合。",
    tags: ["産卵促進", "ビタミン強化", "浮上性"],
  },
  {
    id: "p2",
    name: "GEX グラスアクア CUBE S",
    brand: "GEX",
    category: "水槽",
    price: 3200,
    rating: 4.3,
    description:
      "30cmキューブ水槽。品種管理やペア飼育に最適なサイズ感。付属品が充実。",
    tags: ["30cm", "単独管理", "観察しやすい"],
  },
  {
    id: "p3",
    name: "めだか産卵床 ころたまボール",
    brand: "タマ",
    category: "産卵グッズ",
    price: 450,
    rating: 4.7,
    description:
      "累計販売100万個超えのロングセラー産卵床。卵が絡みつきやすい独自の繊維構造。",
    tags: ["産卵床", "回収しやすい", "洗って再利用"],
  },
  {
    id: "p4",
    name: "グリーンFゴールドリキッド",
    brand: "日本動物薬品",
    category: "薬品",
    price: 900,
    rating: 4.2,
    description:
      "細菌性疾患・水カビ病に有効。稚魚にも使用可能な低刺激タイプ。",
    tags: ["病気予防", "稚魚OK", "水カビ"],
  },
  {
    id: "p5",
    name: "スポンジフィルター M",
    brand: "水作",
    category: "フィルター",
    price: 980,
    rating: 4.6,
    description:
      "稚魚を吸い込まないスポンジフィルター。生物濾過に優れ、メダカ飼育の定番アイテム。",
    tags: ["稚魚安全", "生物濾過", "静音"],
  },
];
