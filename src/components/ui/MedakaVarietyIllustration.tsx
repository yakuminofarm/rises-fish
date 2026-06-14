"use client";

/**
 * 品種別メダカSVGイラスト集
 * シルエット: 実際のメダカの体型を正確に再現
 *   - 丸みのあるコンパクトな体
 *   - やや上向きの口元
 *   - 体の中央〜後方にある背びれ
 *   - 長い尻びれ（メダカの特徴）
 *   - 扇形の尾びれ
 * viewBox: "0 0 220 120"
 */

interface Props {
  size?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// ベースSVGパス定義（メダカの正確なシルエット）
// ─────────────────────────────────────────────────────────────────────
function Base({
  id,
  body,
  body2,
  fin,
  fin2 = fin,
  belly = "#ffffff",
  eye = "#0f172a",
  extras,
}: {
  id: string;
  body: string;
  body2?: string;
  fin: string;
  fin2?: string;
  belly?: string;
  eye?: string;
  extras?: React.ReactNode;
}) {
  const b2 = body2 ?? body;
  return (
    <>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={body} />
          <stop offset="55%" stopColor={body} />
          <stop offset="100%" stopColor={b2} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`fg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fin} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fin2} stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`belly-${id}`} cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor={belly} stopOpacity="0.38" />
          <stop offset="100%" stopColor={belly} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* うろこ模様用パターン */}
        <pattern id={`scale-${id}`} x="0" y="0" width="10" height="8" patternUnits="userSpaceOnUse">
          <ellipse cx="5" cy="4" rx="5" ry="4" fill="none" stroke={b2} strokeWidth="0.5" opacity="0.25" />
        </pattern>
      </defs>

      {/* ── 尾びれ（扇形・二叉） ── */}
      <path
        d="M52,60 L28,34 Q22,28 18,30 Q24,42 24,60 Q24,78 18,90 Q22,92 28,86 L52,60 Z"
        fill={`url(#fg-${id})`}
        stroke={fin} strokeWidth="0.4" strokeOpacity="0.3"
      />
      {/* 尾びれの中央ノッチ */}
      <path d="M18,58 Q24,56 28,60 Q24,64 18,62 Z" fill={b2} opacity="0.4" />

      {/* ── 体 ── */}
      {/* 外形パス: 上向き口元・丸みある体・尾に向かって細くなる */}
      <path
        d={[
          "M 178,48",           // 口元(上)
          "Q 192,52 192,60",    // 頭の丸み
          "Q 192,70 178,73",    // あご
          "Q 160,78 130,78",    // 腹部(後)
          "Q 100,80 75,76",     // 腹部(中)
          "Q 60,74 52,68",      // 腹部(尾寄り)
          "L 52,52",            // 尾茎下
          "Q 60,46 75,44",      // 背中(尾寄り)
          "Q 100,40 130,40",    // 背中(中)
          "Q 160,38 178,48",    // 背中→頭
          "Z",
        ].join(" ")}
        fill={`url(#bg-${id})`}
      />

      {/* うろこ模様 */}
      <path
        d={[
          "M 178,48 Q 192,52 192,60 Q 192,70 178,73",
          "Q 160,78 130,78 Q 100,80 75,76",
          "Q 60,74 52,68 L 52,52",
          "Q 60,46 75,44 Q 100,40 130,40",
          "Q 160,38 178,48 Z",
        ].join(" ")}
        fill={`url(#scale-${id})`}
        opacity="0.6"
      />

      {/* 腹部ハイライト */}
      <path
        d={[
          "M 178,48 Q 192,52 192,60 Q 192,70 178,73",
          "Q 160,78 130,78 Q 100,80 75,76",
          "Q 60,74 52,68 L 52,52",
          "Q 60,46 75,44 Q 100,40 130,40",
          "Q 160,38 178,48 Z",
        ].join(" ")}
        fill={`url(#belly-${id})`}
      />

      {/* カスタム模様 */}
      {extras}

      {/* ── 背びれ（体の中央〜後方、高め）── */}
      <path
        d="M 95,41 Q 100,20 115,16 Q 128,18 138,24 Q 148,30 150,40 Q 135,38 115,40 Q 100,41 95,41 Z"
        fill={`url(#fg-${id})`}
        opacity="0.88"
      />
      {/* 背びれの骨格ライン */}
      <path d="M 100,40 Q 108,25 115,17" stroke={fin} strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 112,40 Q 118,22 124,17" stroke={fin} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 124,40 Q 132,26 138,23" stroke={fin} strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 138,40 Q 146,32 150,40" stroke={fin} strokeWidth="0.8" fill="none" opacity="0.3" />

      {/* ── 尻びれ（長く・体底面に沿う・メダカの特徴）── */}
      <path
        d="M 90,78 Q 85,95 95,102 Q 110,100 130,96 Q 150,93 158,78 Q 145,82 120,82 Q 100,82 90,78 Z"
        fill={`url(#fg-${id})`}
        opacity="0.8"
      />
      {/* 尻びれ骨格 */}
      <path d="M 96,79 Q 94,98 96,102" stroke={fin} strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M 110,80 Q 108,98 112,100" stroke={fin} strokeWidth="0.7" fill="none" opacity="0.35" />
      <path d="M 130,80 Q 130,95 134,97" stroke={fin} strokeWidth="0.7" fill="none" opacity="0.35" />
      <path d="M 148,79 Q 152,92 156,78" stroke={fin} strokeWidth="0.7" fill="none" opacity="0.3" />

      {/* ── 胸びれ（頭近く）── */}
      <path
        d="M 168,62 Q 178,72 172,80 Q 162,78 162,68 Q 162,62 168,62 Z"
        fill={`url(#fg-${id})`}
        opacity="0.7"
      />

      {/* ── 体表光沢ライン ── */}
      <path
        d="M 65,52 Q 110,46 160,50"
        stroke="white" strokeWidth="2.5" fill="none" opacity="0.18" strokeLinecap="round"
      />

      {/* ── 頭部（輪郭を再描画してなじませる）── */}
      <ellipse cx="185" cy="60" rx="13" ry="14" fill={`url(#bg-${id})`} />

      {/* えら線 */}
      <path d="M 172,48 Q 168,60 172,72" stroke={b2} strokeWidth="1.2" fill="none" opacity="0.35" strokeLinecap="round" />

      {/* ── 目 ── */}
      <circle cx="184" cy="54" r="7.5" fill="white" />
      <circle cx="185" cy="54" r="5.5" fill={eye} />
      <circle cx="186" cy="54" r="3" fill={eye} opacity="0.8" />
      {/* 瞳の光 */}
      <circle cx="187.5" cy="52.5" r="1.8" fill="white" opacity="0.95" />
      <circle cx="184.5" cy="55.5" r="0.8" fill="white" opacity="0.5" />

      {/* 口 */}
      <path d="M 192,57 Q 196,60 192,63" stroke={b2} strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 品種別イラスト
// ─────────────────────────────────────────────────────────────────────

/** 幹之: 青白い体 + 背中を走る体外光ライン */
export function KanayukiSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="kanayuki" body="#93c5fd" body2="#0284c7" fin="#bae6fd" fin2="#7dd3fc" belly="#e0f2fe"
        extras={
          <>
            <path d="M60,50 Q115,44 168,48" stroke="#dbeafe" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.45" />
            <path d="M60,50 Q115,44 168,48" stroke="white"   strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.95" />
          </>
        }
      />
    </svg>
  );
}

/** 楊貴妃: 深い橙色 */
export function YokihiSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="yokihi" body="#fb923c" body2="#c2410c" fin="#fed7aa" fin2="#fdba74" belly="#fff7ed"
        extras={
          <ellipse cx="120" cy="56" rx="50" ry="16" fill="#f97316" opacity="0.2" />
        }
      />
    </svg>
  );
}

/** 三色: 白地に橙・黒まだら */
export function SanshokuSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="sanshoku" body="#f8fafc" body2="#cbd5e1" fin="#e2e8f0" fin2="#94a3b8" eye="#1e293b"
        extras={
          <>
            <ellipse cx="105" cy="55" rx="20" ry="11" fill="#f97316" opacity="0.78" />
            <ellipse cx="145" cy="62" rx="13" ry="9"  fill="#fb923c" opacity="0.7"  />
            <ellipse cx="85"  cy="64" rx="12" ry="8"  fill="#1e293b" opacity="0.7"  />
            <ellipse cx="125" cy="46" rx="10" ry="6"  fill="#334155" opacity="0.6"  />
            <ellipse cx="160" cy="56" rx="8"  ry="6"  fill="#1e293b" opacity="0.55" />
          </>
        }
      />
    </svg>
  );
}

/** 黒メダカ: 黒褐色の野生型 */
export function KuroSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="kuro" body="#475569" body2="#1e293b" fin="#64748b" fin2="#334155" eye="#0f172a" belly="#334155"
        extras={
          <>
            <path d="M62,52 Q115,48 165,52" stroke="#64748b" strokeWidth="1"   fill="none" opacity="0.4" />
            <path d="M62,64 Q115,60 165,64" stroke="#475569" strokeWidth="0.7" fill="none" opacity="0.3" />
          </>
        }
      />
    </svg>
  );
}

/** 白メダカ: 透き通る白 */
export function ShiroSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="shiro" body="#f1f5f9" body2="#e2e8f0" fin="#e2e8f0" fin2="#cbd5e1" eye="#475569" belly="#ffffff"
        extras={
          <ellipse cx="122" cy="55" rx="55" ry="18" fill="#bae6fd" opacity="0.1" />
        }
      />
    </svg>
  );
}

/** 青メダカ: スチールブルー */
export function AoSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="ao" body="#38bdf8" body2="#0369a1" fin="#7dd3fc" fin2="#38bdf8" belly="#e0f2fe"
        extras={
          <path d="M60,50 Q115,44 168,48" stroke="#bae6fd" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
        }
      />
    </svg>
  );
}

/** みゆき: 全身を覆う体外光 */
export function MiyukiSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="miyuki" body="#dbeafe" body2="#93c5fd" fin="#eff6ff" fin2="#dbeafe" belly="#ffffff"
        extras={
          <>
            <path d="M55,50 Q115,42 170,47" stroke="#e0f2fe" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M55,50 Q115,42 170,47" stroke="white"   strokeWidth="3"  fill="none" strokeLinecap="round" opacity="1" />
          </>
        }
      />
    </svg>
  );
}

/** オロチ: 漆黒 */
export function OrochiSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="orochi" body="#0f172a" body2="#020617" fin="#1e293b" fin2="#0f172a" eye="#1e3a5f" belly="#0f172a"
        extras={
          <ellipse cx="120" cy="52" rx="50" ry="14" fill="#1e3a5f" opacity="0.2" />
        }
      />
    </svg>
  );
}

/** 紅帝: 深紅 */
export function KoteiSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="kotei" body="#ef4444" body2="#991b1b" fin="#fca5a5" fin2="#f87171" belly="#fff1f2"
        extras={
          <ellipse cx="120" cy="54" rx="48" ry="15" fill="#dc2626" opacity="0.3" />
        }
      />
    </svg>
  );
}

/** 煌: 黄金色 + 体外光 */
export function KiraraSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="kirara" body="#fbbf24" body2="#b45309" fin="#fde68a" fin2="#fcd34d" belly="#fffbeb"
        extras={
          <>
            <path d="M60,50 Q115,44 168,48" stroke="#fef9c3" strokeWidth="7"   fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M60,50 Q115,44 168,48" stroke="#fffbeb" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
          </>
        }
      />
    </svg>
  );
}

/** サファイア: コバルトブルー + 光沢 */
export function SapphireSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="sapphire" body="#3b82f6" body2="#1e3a8a" fin="#93c5fd" fin2="#60a5fa" belly="#dbeafe"
        extras={
          <>
            <path d="M60,50 Q115,44 168,48" stroke="#bfdbfe" strokeWidth="6"   fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M60,50 Q115,44 168,48" stroke="#eff6ff" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.85" />
          </>
        }
      />
    </svg>
  );
}

/** 夜桜: ピンク〜紫 + 桜色斑点 */
export function YozakuraSVG({ size = 200, className = "" }: Props) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * 0.545} className={className}>
      <Base id="yozakura" body="#e879f9" body2="#7e22ce" fin="#f0abfc" fin2="#d946ef" belly="#fdf4ff"
        extras={
          <>
            <circle cx="92"  cy="56" r="7"   fill="#fbcfe8" opacity="0.5"  />
            <circle cx="112" cy="50" r="5"   fill="#fce7f3" opacity="0.45" />
            <circle cx="133" cy="60" r="6"   fill="#fbcfe8" opacity="0.42" />
            <circle cx="153" cy="52" r="4"   fill="#fce7f3" opacity="0.5"  />
            <path d="M60,49 Q115,43 168,47" stroke="#f0abfc" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          </>
        }
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 品種名 → コンポーネント
// ─────────────────────────────────────────────────────────────────────
const VARIETY_COMPONENTS: Record<string, React.ComponentType<Props>> = {
  幹之:      KanayukiSVG,
  楊貴妃:    YokihiSVG,
  三色:      SanshokuSVG,
  黒メダカ:  KuroSVG,
  白メダカ:  ShiroSVG,
  青メダカ:  AoSVG,
  みゆき:    MiyukiSVG,
  オロチ:    OrochiSVG,
  紅帝:      KoteiSVG,
  煌:        KiraraSVG,
  サファイア:SapphireSVG,
  夜桜:      YozakuraSVG,
};

export function VarietyMedakaSVG({
  variety,
  size = 200,
  className = "",
}: {
  variety: string;
  size?: number;
  className?: string;
}) {
  const Component = VARIETY_COMPONENTS[variety] ?? AoSVG;
  return <Component size={size} className={className} />;
}

// ─────────────────────────────────────────────────────────────────────
// 水景SVG（ヒーロー背景用 — 新シルエットで描画）
// ─────────────────────────────────────────────────────────────────────
export function AquaSceneSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 160" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="aq-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
        </linearGradient>
        <filter id="aq-glow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="360" height="160" fill="url(#aq-water)" />
      {/* 光の筋 */}
      {[30,90,150,215,280,335].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x+16} y2="160" stroke="white" strokeWidth="0.7" opacity="0.07" />
      ))}
      {/* 水草 */}
      {[15,52,308,348].map((x, i) => (
        <g key={i} transform={`translate(${x},95)`}>
          <path d={`M0,65 Q${i%2===0?-8:8},30 2,0`} stroke="#4ade80" strokeWidth="2.5" fill="none" opacity="0.6" />
          <path d={`M0,52 Q${i%2===0?10:-10},28 5,8`} stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      ))}
      {/* 泡 */}
      {[38,78,128,178,238,298].map((x, i) => (
        <circle key={i} cx={x} cy={52+(i*13)%72} r={2.5+(i%3)} fill="none" stroke="white" strokeWidth="0.7" opacity="0.2" />
      ))}
      {/* ミニチュアメダカ (新シルエット) */}
      {/* 幹之 */}
      <g transform="translate(48,46) scale(0.27)" filter="url(#aq-glow)">
        <path d="M178,48 Q192,52 192,60 Q192,70 178,73 Q160,78 130,78 Q100,80 75,76 Q60,74 52,68 L52,52 Q60,46 75,44 Q100,40 130,40 Q160,38 178,48Z" fill="#7dd3fc" opacity="0.95" />
        <path d="M52,60 L28,34 Q22,28 18,30 Q24,42 24,60 Q24,78 18,90 Q22,92 28,86 L52,60Z" fill="#bae6fd" opacity="0.7" />
        <path d="M65,50 Q115,44 168,48" stroke="white" strokeWidth="4" fill="none" opacity="0.95" />
        <circle cx="184" cy="54" r="7.5" fill="white" />
        <circle cx="185" cy="54" r="5" fill="#0c4a6e" />
        <circle cx="187" cy="52" r="2" fill="white" opacity="0.9" />
      </g>
      {/* 楊貴妃 */}
      <g transform="translate(132,72) scale(0.24)" filter="url(#aq-glow)">
        <path d="M178,48 Q192,52 192,60 Q192,70 178,73 Q160,78 130,78 Q100,80 75,76 Q60,74 52,68 L52,52 Q60,46 75,44 Q100,40 130,40 Q160,38 178,48Z" fill="#fb923c" opacity="0.95" />
        <path d="M52,60 L28,34 Q22,28 18,30 Q24,42 24,60 Q24,78 18,90 Q22,92 28,86 L52,60Z" fill="#fed7aa" opacity="0.7" />
        <circle cx="184" cy="54" r="7" fill="white" />
        <circle cx="185" cy="54" r="4.5" fill="#7c2d12" />
        <circle cx="187" cy="52" r="1.8" fill="white" opacity="0.9" />
      </g>
      {/* 夜桜 */}
      <g transform="translate(215,42) scale(0.22)" filter="url(#aq-glow)">
        <path d="M178,48 Q192,52 192,60 Q192,70 178,73 Q160,78 130,78 Q100,80 75,76 Q60,74 52,68 L52,52 Q60,46 75,44 Q100,40 130,40 Q160,38 178,48Z" fill="#e879f9" opacity="0.9" />
        <path d="M52,60 L28,34 Q22,28 18,30 Q24,42 24,60 Q24,78 18,90 Q22,92 28,86 L52,60Z" fill="#f0abfc" opacity="0.65" />
        <path d="M65,49 Q115,43 168,47" stroke="#f0abfc" strokeWidth="3" fill="none" opacity="0.7" />
        <circle cx="184" cy="54" r="7" fill="white" />
        <circle cx="185" cy="54" r="4.5" fill="#581c87" />
        <circle cx="187" cy="52" r="1.8" fill="white" opacity="0.9" />
      </g>
      {/* 煌 */}
      <g transform="translate(286,85) scale(0.2)">
        <path d="M178,48 Q192,52 192,60 Q192,70 178,73 Q160,78 130,78 Q100,80 75,76 Q60,74 52,68 L52,52 Q60,46 75,44 Q100,40 130,40 Q160,38 178,48Z" fill="#fbbf24" opacity="0.92" />
        <path d="M52,60 L28,34 Q22,28 18,30 Q24,42 24,60 Q24,78 18,90 Q22,92 28,86 L52,60Z" fill="#fde68a" opacity="0.65" />
        <path d="M65,49 Q115,43 168,47" stroke="#fffbeb" strokeWidth="4" fill="none" opacity="0.85" />
        <circle cx="184" cy="54" r="7" fill="white" />
        <circle cx="185" cy="54" r="4.5" fill="#78350f" />
        <circle cx="187" cy="52" r="1.8" fill="white" opacity="0.9" />
      </g>
      {/* 底砂利 */}
      <ellipse cx="180" cy="158" rx="200" ry="10" fill="#0c4a6e" opacity="0.7" />
      {[28,68,108,148,188,228,268,308].map((x, i) => (
        <ellipse key={i} cx={x} cy={154+(i%3)} rx={3.5+(i%3)} ry="2" fill="#164e63" opacity="0.5" />
      ))}
    </svg>
  );
}
