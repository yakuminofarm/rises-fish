// SVGイラスト集
export function MedakaFishSVG({
  color = "#f97316",
  size = 48,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 80 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 尾ひれ */}
      <path
        d="M8 24 L18 14 L18 34 Z"
        fill={color}
        opacity="0.7"
      />
      {/* 体 */}
      <ellipse cx="42" cy="24" rx="26" ry="14" fill={color} />
      {/* 光沢 */}
      <ellipse cx="46" cy="18" rx="10" ry="5" fill="white" opacity="0.3" transform="rotate(-15 46 18)" />
      {/* 胸ひれ */}
      <path
        d="M38 28 Q44 36 50 30"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* 背びれ */}
      <path
        d="M36 11 Q44 4 52 11"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 目 */}
      <circle cx="62" cy="21" r="4" fill="white" />
      <circle cx="63" cy="21" r="2.5" fill="#1e293b" />
      <circle cx="64" cy="20" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export function BubblesSVG({ count = 5 }: { count?: number }) {
  const bubbles = Array.from({ length: count }, (_, i) => ({
    cx: 10 + i * 18,
    cy: 20 - (i % 3) * 6,
    r: 2 + (i % 3),
    delay: i * 0.3,
  }));

  return (
    <svg width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export function WaterWaveSVG({ color = "#0ea5e9" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
    >
      <path
        d="M0,30 C50,10 100,50 150,30 C200,10 250,50 300,30 C350,10 400,50 400,30 L400,60 L0,60 Z"
        fill={color}
        opacity="0.15"
      />
      <path
        d="M0,40 C60,20 120,55 180,35 C240,15 300,50 360,35 C380,28 400,38 400,38 L400,60 L0,60 Z"
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
}

// 品種に対応した色
export const VARIETY_COLORS: Record<string, string> = {
  幹之: "#60a5fa",       // 青白い光沢
  楊貴妃: "#f97316",     // 橙
  三色: "#ec4899",       // ピンク
  黒メダカ: "#475569",   // 深みのある黒
  白メダカ: "#e2e8f0",   // 白
  青メダカ: "#38bdf8",   // 青
  みゆき: "#a78bfa",     // 紫がかった青
  オロチ: "#334155",     // 漆黒
  紅帝: "#ef4444",       // 鮮やかな赤
  煌: "#fbbf24",         // 金
  サファイア: "#3b82f6", // サファイアブルー
  夜桜: "#c084fc",       // 夜桜ピンク
  その他: "#06b6d4",
};

export function getVarietyColor(variety: string): string {
  return VARIETY_COLORS[variety] ?? "#06b6d4";
}

// 品種ごとの実写イメージ (Unsplash - 魚・金魚・メダカ系)
export const VARIETY_PHOTOS: Record<string, string> = {
  幹之:    "https://images.unsplash.com/photo-1596854373635-91d3b1e29e7d?w=400&q=80&auto=format&fit=crop",  // 青みがかった魚
  楊貴妃:  "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&q=80&auto=format&fit=crop",  // 橙色の金魚
  三色:    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80&auto=format&fit=crop",  // カラフルな熱帯魚
  黒メダカ:"https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=400&q=80&auto=format&fit=crop",  // 暗い水中
  白メダカ:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop",  // 白い魚系
  青メダカ:"https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400&q=80&auto=format&fit=crop",  // 青い水槽
  みゆき:  "https://images.unsplash.com/photo-1596854373635-91d3b1e29e7d?w=400&q=80&auto=format&fit=crop",
  オロチ:  "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=400&q=80&auto=format&fit=crop",
  紅帝:    "https://images.unsplash.com/photo-1583836631474-f2cf7b05e5de?w=400&q=80&auto=format&fit=crop",  // 赤い魚
  煌:      "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?w=400&q=80&auto=format&fit=crop",  // 金色の鯉
  サファイア:"https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&q=80&auto=format&fit=crop", // 青い魚
  夜桜:    "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=400&q=80&auto=format&fit=crop",  // 桜ピンク系
  その他:  "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80&auto=format&fit=crop",
};

export function getVarietyPhoto(variety: string): string {
  return VARIETY_PHOTOS[variety] ?? VARIETY_PHOTOS["その他"];
}

// 品種の絵文字
export const VARIETY_EMOJI: Record<string, string> = {
  幹之: "✨",
  楊貴妃: "🟠",
  三色: "🎨",
  黒メダカ: "🖤",
  白メダカ: "🤍",
  青メダカ: "💙",
  みゆき: "💜",
  オロチ: "⚫",
  紅帝: "❤️",
  煌: "⭐",
  サファイア: "💎",
  夜桜: "🌸",
  その他: "🐟",
};

export function getVarietyEmoji(variety: string): string {
  return VARIETY_EMOJI[variety] ?? "🐟";
}
