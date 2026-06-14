import { Medaka, NewsItem, Product, ColumnArticle, Breeder } from "@/types/medaka";

// Unsplash の実写メダカ・魚・水槽写真
const FISH_PHOTOS = {
  // 橙・金魚系 (楊貴妃・紅帝)
  orange: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&q=80&auto=format&fit=crop",
  // 青・銀系 (幹之・青メダカ)
  blue:   "https://images.unsplash.com/photo-1596854373635-91d3b1e29e7d?w=400&q=80&auto=format&fit=crop",
  // 水槽全景
  tank:   "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&q=80&auto=format&fit=crop",
  // カラフル熱帯魚
  colorful:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80&auto=format&fit=crop",
  // 金鯉
  koi:    "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?w=400&q=80&auto=format&fit=crop",
  // 赤系
  red:    "https://images.unsplash.com/photo-1583836631474-f2cf7b05e5de?w=400&q=80&auto=format&fit=crop",
  // 水草・産卵床
  plant:  "https://images.unsplash.com/photo-1467579424161-4dce30b41e6f?w=400&q=80&auto=format&fit=crop",
  // 群れで泳ぐ
  school: "https://images.unsplash.com/photo-1619529803760-f02a4aad5024?w=400&q=80&auto=format&fit=crop",
  // 品評会・イベント的な清涼感ある写真
  event:  "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&q=80&auto=format&fit=crop",
};

export const mockMedakas: Medaka[] = [
  {
    id: "m1",
    name: "幹之1号",
    variety: "幹之",
    gender: "male",
    acquiredDate: "2024-04-01",
    birthDate: "2024-03-15",
    photos: [
      { id: "p-m1-1", url: FISH_PHOTOS.blue, takenAt: "2024-06-01", label: "全体像" },
    ],
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
    photos: [
      { id: "p-m2-1", url: FISH_PHOTOS.orange, takenAt: "2024-06-01", label: "全体像" },
    ],
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
    photos: [
      { id: "p-m3-1", url: FISH_PHOTOS.colorful, takenAt: "2024-07-05", label: "全体像" },
    ],
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
    imageUrl: FISH_PHOTOS.koi,
    category: "品種",
    publishedAt: "2024-06-10",
    source: "メダカ品種図鑑",
  },
  {
    id: "n2",
    title: "夏の水温対策｜メダカを猛暑から守る5つの方法",
    summary:
      "35℃を超える水温はメダカに致命的。すだれや遮光ネット、水換えのタイミングなど実践的な対策をまとめました。",
    imageUrl: FISH_PHOTOS.tank,
    category: "飼育",
    publishedAt: "2024-06-08",
    source: "めだか本舗",
  },
  {
    id: "n3",
    title: "秋の品評会2024｜全国メダカ品評会エントリー開始",
    summary:
      "今年も全国規模のメダカ品評会が開催。幹之部門・三色部門・新品種部門など計8カテゴリーで競います。",
    imageUrl: FISH_PHOTOS.event,
    category: "イベント",
    publishedAt: "2024-06-05",
    source: "日本メダカ協会",
  },
  {
    id: "n4",
    title: "産卵床の新素材「モスカーテン」が話題に",
    summary:
      "ジャワモスを模した人工産卵床が飼育者の間でヒット。卵の回収率が従来比1.5倍という報告も。",
    imageUrl: FISH_PHOTOS.plant,
    category: "商品",
    publishedAt: "2024-06-01",
    source: "アクアリウムジャーナル",
  },
];

// 実際の商品写真に近いUnsplash画像
const PRODUCT_PHOTOS = {
  food:   "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=300&q=80&auto=format&fit=crop",
  tank:   "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=300&q=80&auto=format&fit=crop",
  filter: "https://images.unsplash.com/photo-1467579424161-4dce30b41e6f?w=300&q=80&auto=format&fit=crop",
  med:    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80&auto=format&fit=crop",
  spawn:  "https://images.unsplash.com/photo-1625224042086-ad0dd09acaf4?w=300&q=80&auto=format&fit=crop",
};

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
    imageUrl: PRODUCT_PHOTOS.food,
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
    imageUrl: PRODUCT_PHOTOS.tank,
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
    imageUrl: PRODUCT_PHOTOS.spawn,
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
    imageUrl: PRODUCT_PHOTOS.med,
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
    imageUrl: PRODUCT_PHOTOS.filter,
    tags: ["稚魚安全", "生物濾過", "静音"],
  },
];

// ──────────────────────────────────────
// ブリーダーコラム
// ──────────────────────────────────────

const mockBreeders: Breeder[] = [
  {
    id: "b1",
    name: "田中 誠一",
    handle: "@tanaka_miyuki",
    specialty: "幹之・みゆき",
    location: "埼玉県",
    bio: "幹之の体外光研究に20年。フルボディ体外光の固定に成功し、全国品評会で3度の最高賞受賞。",
    avatarColor: "#0ea5e9",
    avatarEmoji: "✨",
    followersK: 12.4,
    awards: ["全国品評会 最高賞 × 3", "関東オープン 幹之部門 優勝"],
  },
  {
    id: "b2",
    name: "鈴木 彩花",
    handle: "@suzuki_yozakura",
    specialty: "夜桜・三色",
    location: "京都府",
    bio: "色彩の魔術師と称される夜桜ブリーダー。独自の遮光管理法で発色を極限まで引き出す。",
    avatarColor: "#d946ef",
    avatarEmoji: "🌸",
    followersK: 8.7,
    awards: ["関西メダカ祭り 夜桜部門 2連覇"],
  },
  {
    id: "b3",
    name: "佐藤 龍一",
    handle: "@sato_kotei",
    specialty: "紅帝・楊貴妃",
    location: "愛知県",
    bio: "赤系品種の第一人者。紅帝の深紅発色を追求し続けて15年。稚魚の育成ノウハウを広く発信中。",
    avatarColor: "#ef4444",
    avatarEmoji: "❤️",
    followersK: 15.2,
    awards: ["全国品評会 紅帝部門 優勝 × 2", "中部メダカ協会 功労賞"],
  },
];

export const mockColumns: ColumnArticle[] = [
  {
    id: "c1",
    title: "フルボディ体外光を安定固定するための選別眼を磨く",
    lead: "幹之メダカの最高峰「フルボディ体外光」。その固定率を上げるために、私が20年かけて培ってきた選別の考え方をお伝えします。",
    body: [
      "体外光の固定には、ただ光が強い個体同士を掛け合わせるだけでは不十分です。光の「質」と「範囲」を正確に見極める眼が必要になります。",
      "私がとくに重視するのは、光の起点の位置です。背びれ付近から始まる光は頭部まで伸びやすい傾向があります。逆に尾付近から始まる光は、いくら面積が広くても次世代で縮退することが多い。",
      "選別の際は必ず上見・横見の両方で確認してください。上見で光が途切れていなくても、横見で体側が暗い個体は固定率が落ちます。この両面を満たす個体こそが、次世代の礎になります。",
      "また、選別の時期は孵化後60〜90日が最適です。光の発現には水温と日照時間が大きく影響するため、この時期に十分な光量を与えながら選別すると精度が上がります。",
    ],
    imageUrl: FISH_PHOTOS.blue,
    category: "品種改良",
    publishedAt: "2024-06-12",
    readMinutes: 5,
    breeder: mockBreeders[0],
    featuredVariety: "幹之",
    tags: ["幹之", "体外光", "選別", "固定率"],
  },
  {
    id: "c2",
    title: "夜桜の発色を最大限に引き出す遮光管理術",
    lead: "夜桜の美しさは光の管理で大きく変わります。私が実践している独自の遮光メソッドを初公開します。",
    body: [
      "夜桜はその名の通り、暗い環境下で真価を発揮する品種です。直射日光に長時間さらすと、ピンクと紫の発色が褪色してしまう傾向があります。",
      "私のポイントは「朝2時間だけ直射日光を当てる」こと。早朝の柔らかい光はメダカのビタミンD生成に必要な紫外線を与えつつ、色素細胞を刺激しすぎません。",
      "その後は遮光ネットで65〜70%の遮光を維持します。暗すぎると食欲が落ちるので、明るいが直射ではない状態を保つことが理想です。",
      "水温は26〜28℃をキープ。低すぎると発色が遅れ、高すぎると色が飛びます。この温度帯で1ヶ月飼育すれば、発色の違いを実感できるはずです。",
    ],
    imageUrl: FISH_PHOTOS.colorful,
    category: "飼育環境",
    publishedAt: "2024-06-08",
    readMinutes: 4,
    breeder: mockBreeders[1],
    featuredVariety: "夜桜",
    tags: ["夜桜", "発色", "遮光", "水温管理"],
  },
  {
    id: "c3",
    title: "稚魚の生存率を劇的に上げる初期餌付けの秘訣",
    lead: "孵化直後の稚魚をいかに生き残らせるか。紅帝ブリーダー歴15年の経験から導いた、稚魚管理の核心をお伝えします。",
    body: [
      "稚魚の最大の死因は「餓死」と「消化不良」です。孵化後48時間は卵黄嚢で栄養を得ていますが、その後は速やかに外部からの栄養補給が必要になります。",
      "私が使うのはゾウリムシ×PSB（光合成細菌）の組み合わせです。ゾウリムシは稚魚の口径に最適なサイズで、消化吸収もよい。PSBは水質安定と腸内環境の整備に効果的です。",
      "与える量は「30分で食べきれる量」が目安。食べ残しが底に溜まると水質悪化が起き、稚魚が一気に落ちます。スポイトで底のゴミを毎日取り除くことも欠かせません。",
      "生後2週間を乗り越えれば、あとは一気に強くなります。最初の壁を超えるための丁寧な管理が、その後の大きな差を生みます。",
    ],
    imageUrl: FISH_PHOTOS.orange,
    category: "繁殖技術",
    publishedAt: "2024-06-03",
    readMinutes: 6,
    breeder: mockBreeders[2],
    featuredVariety: "紅帝",
    tags: ["稚魚", "餌付け", "ゾウリムシ", "PSB", "生存率"],
  },
];

// ホームヒーロー用の水槽写真
export const HERO_PHOTO = "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&q=80&auto=format&fit=crop";

// 品種ショーケース用の魚写真
export const VARIETY_SHOWCASE = [
  { variety: "幹之",  photo: "https://images.unsplash.com/photo-1596854373635-91d3b1e29e7d?w=200&q=80&auto=format&fit=crop" },
  { variety: "楊貴妃",photo: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=200&q=80&auto=format&fit=crop" },
  { variety: "三色",  photo: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200&q=80&auto=format&fit=crop" },
  { variety: "夜桜",  photo: "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?w=200&q=80&auto=format&fit=crop" },
];
