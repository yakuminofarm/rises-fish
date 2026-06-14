"use client";

/**
 * 品種別メダカSVGイラスト集
 * viewBox: "0 0 160 80" — 横長でメダカの体型を自然に表現
 */

interface Props {
  size?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// ベースコンポーネント: メダカの基本形状 + 共通フィン構造
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
  return (
    <>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={body} />
          <stop offset="100%" stopColor={body2 ?? body} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`fg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fin} stopOpacity="0.85" />
          <stop offset="100%" stopColor={fin2} stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`belly-${id}`} cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor={belly} stopOpacity="0.4" />
          <stop offset="100%" stopColor={belly} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 尾ひれ */}
      <path d="M20,40 L5,22 L4,40 L5,58 Z"
        fill={`url(#fg-${id})`} stroke={fin} strokeWidth="0.4" strokeOpacity="0.4" />
      {/* 体 */}
      <ellipse cx="80" cy="40" rx="60" ry="22" fill={`url(#bg-${id})`} />
      {/* 腹部ハイライト */}
      <ellipse cx="80" cy="40" rx="60" ry="22" fill={`url(#belly-${id})`} />
      {/* 背びれ */}
      <path d="M65,19 Q80,8 102,15 Q88,19 66,19 Z" fill={`url(#fg-${id})`} opacity="0.85" />
      {/* 胸びれ */}
      <path d="M108,43 Q118,54 110,59 Q101,55 108,43 Z" fill={`url(#fg-${id})`} opacity="0.7" />
      {/* 腹びれ */}
      <path d="M74,61 Q82,71 76,75 Q68,69 74,61 Z" fill={`url(#fg-${id})`} opacity="0.6" />
      {/* 体表光沢 */}
      <ellipse cx="84" cy="30" rx="26" ry="7" fill="white" opacity="0.15" transform="rotate(-4,84,30)" />

      {/* カスタム模様・発光 */}
      {extras}

      {/* 頭部 */}
      <ellipse cx="130" cy="40" rx="13" ry="16" fill={`url(#bg-${id})`} />
      {/* えら */}
      <path d="M118,28 Q116,40 118,52" stroke={body2 ?? body} strokeWidth="1" fill="none" opacity="0.35" />
      {/* 目(白目) */}
      <circle cx="135" cy="35" r="6.5" fill="white" />
      {/* 目(瞳) */}
      <circle cx="136" cy="35" r="4.5" fill={eye} />
      {/* 目の光 */}
      <circle cx="137.5" cy="33.5" r="1.8" fill="white" opacity="0.9" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 品種別イラスト
// ─────────────────────────────────────────────────────────────────────

/** 幹之: 青白い体に白銀の体外光ライン */
export function KanayukiSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="kanayuki" body="#7dd3fc" body2="#0284c7" fin="#bae6fd" fin2="#93c5fd" belly="#e0f2fe"
        extras={
          <>
            {/* 体外光ハロー */}
            <path d="M28,26 Q80,19 132,26" stroke="#dbeafe" strokeWidth="7"
              fill="none" strokeLinecap="round" opacity="0.45" />
            {/* 体外光コアライン */}
            <path d="M28,26 Q80,19 132,26" stroke="white" strokeWidth="2.5"
              fill="none" strokeLinecap="round" opacity="0.95" />
          </>
        }
      />
    </svg>
  );
}

/** 楊貴妃: 深い橙色〜朱色のグラデーション */
export function YokihiSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="yokihi" body="#fb923c" body2="#c2410c" fin="#fed7aa" fin2="#fdba74" belly="#fff7ed"
        extras={
          <ellipse cx="78" cy="36" rx="42" ry="13" fill="#f97316" opacity="0.25" />
        }
      />
    </svg>
  );
}

/** 三色: 白地に橙と黒のまだら */
export function SanshokuSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="sanshoku" body="#f8fafc" body2="#e2e8f0" fin="#cbd5e1" fin2="#94a3b8" eye="#1e293b"
        extras={
          <>
            <ellipse cx="58" cy="34" rx="18" ry="10" fill="#f97316" opacity="0.8" />
            <ellipse cx="96" cy="39" rx="12" ry="8"  fill="#fb923c" opacity="0.7" />
            <ellipse cx="44" cy="43" rx="11" ry="7"  fill="#1e293b" opacity="0.72" />
            <ellipse cx="77" cy="27" rx="8"  ry="5"  fill="#334155" opacity="0.6" />
            <ellipse cx="112" cy="36" rx="7" ry="5"  fill="#1e293b" opacity="0.58" />
          </>
        }
      />
    </svg>
  );
}

/** 黒メダカ: 野生型の黒褐色 */
export function KuroSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="kuro" body="#475569" body2="#1e293b" fin="#64748b" fin2="#334155" eye="#0f172a" belly="#334155"
        extras={
          <>
            <path d="M34,37 Q80,33 126,37" stroke="#64748b" strokeWidth="1"   fill="none" opacity="0.45" />
            <path d="M34,43 Q80,39 126,43" stroke="#475569" strokeWidth="0.7" fill="none" opacity="0.3" />
          </>
        }
      />
    </svg>
  );
}

/** 白メダカ: 透き通る純白 */
export function ShiroSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="shiro" body="#f1f5f9" body2="#e2e8f0" fin="#e2e8f0" fin2="#cbd5e1" eye="#475569" belly="#ffffff"
        extras={
          <ellipse cx="80" cy="37" rx="50" ry="17" fill="#bae6fd" opacity="0.12" />
        }
      />
    </svg>
  );
}

/** 青メダカ: スチールブルー */
export function AoSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="ao" body="#38bdf8" body2="#0369a1" fin="#7dd3fc" fin2="#38bdf8" belly="#e0f2fe"
        extras={
          <path d="M28,29 Q80,23 132,29" stroke="#bae6fd" strokeWidth="2"
            fill="none" strokeLinecap="round" opacity="0.55" />
        }
      />
    </svg>
  );
}

/** みゆき: 幹之より明るい白銀〜フルボディ光 */
export function MiyukiSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="miyuki" body="#dbeafe" body2="#93c5fd" fin="#eff6ff" fin2="#dbeafe" belly="#ffffff"
        extras={
          <>
            {/* フルボディ体外光ハロー */}
            <path d="M18,24 Q80,16 138,24" stroke="#eff6ff" strokeWidth="10"
              fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M18,24 Q80,16 138,24" stroke="white" strokeWidth="3"
              fill="none" strokeLinecap="round" opacity="1" />
          </>
        }
      />
    </svg>
  );
}

/** オロチ: 漆黒の漆黒 */
export function OrochiSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="orochi" body="#0f172a" body2="#020617" fin="#1e293b" fin2="#0f172a"
        eye="#1e3a5f" belly="#0f172a"
        extras={
          <>
            <ellipse cx="80" cy="35" rx="48" ry="15" fill="#0f172a" opacity="0.6" />
            {/* かすかな青みの光沢 */}
            <ellipse cx="80" cy="29" rx="28" ry="5" fill="#1e3a5f" opacity="0.25" />
          </>
        }
      />
    </svg>
  );
}

/** 紅帝: 鮮血のような深紅 */
export function KoteiSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="kotei" body="#ef4444" body2="#991b1b" fin="#fca5a5" fin2="#f87171" belly="#fff1f2"
        extras={
          <>
            <ellipse cx="80" cy="35" rx="44" ry="14" fill="#dc2626" opacity="0.35" />
            <path d="M34,37 Q80,33 126,37" stroke="#fca5a5" strokeWidth="1.5"
              fill="none" opacity="0.4" />
          </>
        }
      />
    </svg>
  );
}

/** 煌: 金色の輝きと体外光 */
export function KiraraSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="kirara" body="#fbbf24" body2="#b45309" fin="#fde68a" fin2="#fcd34d" belly="#fffbeb"
        extras={
          <>
            <path d="M28,26 Q80,19 132,26" stroke="#fef9c3" strokeWidth="7"
              fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M28,26 Q80,19 132,26" stroke="#fffbeb" strokeWidth="2.5"
              fill="none" strokeLinecap="round" opacity="0.9" />
            <ellipse cx="80" cy="33" rx="38" ry="10" fill="#fbbf24" opacity="0.2" />
          </>
        }
      />
    </svg>
  );
}

/** サファイア: 深いコバルトブルー + 光沢ライン */
export function SapphireSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="sapphire" body="#3b82f6" body2="#1e3a8a" fin="#93c5fd" fin2="#60a5fa" belly="#dbeafe"
        extras={
          <>
            <path d="M28,26 Q80,19 132,26" stroke="#bfdbfe" strokeWidth="5"
              fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M28,26 Q80,19 132,26" stroke="#eff6ff" strokeWidth="2"
              fill="none" strokeLinecap="round" opacity="0.85" />
            <ellipse cx="80" cy="33" rx="40" ry="11" fill="#2563eb" opacity="0.25" />
          </>
        }
      />
    </svg>
  );
}

/** 夜桜: ピンク〜紫のグラデーション + 桜色の斑 */
export function YozakuraSVG({ size = 160, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 80" width={size} height={size * 0.5} className={className}>
      <Base id="yozakura" body="#e879f9" body2="#7e22ce" fin="#f0abfc" fin2="#d946ef" belly="#fdf4ff"
        extras={
          <>
            <circle cx="54"  cy="36" r="6"   fill="#fbcfe8" opacity="0.5" />
            <circle cx="74"  cy="29" r="4.5" fill="#fce7f3" opacity="0.45" />
            <circle cx="95"  cy="38" r="5.5" fill="#fbcfe8" opacity="0.42" />
            <circle cx="113" cy="31" r="3.5" fill="#fce7f3" opacity="0.5" />
            <path d="M28,27 Q80,21 132,27" stroke="#f0abfc" strokeWidth="2.5"
              fill="none" strokeLinecap="round" opacity="0.6" />
          </>
        }
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 品種名 → コンポーネント の対応表
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

/** 品種名を渡すだけで対応イラストを描画 */
export function VarietyMedakaSVG({
  variety,
  size = 160,
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
// 水景SVG (ヒーローバナー用背景)
// ─────────────────────────────────────────────────────────────────────
export function AquaSceneSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 160" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="aq-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
        </linearGradient>
        <filter id="aq-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="360" height="160" fill="url(#aq-water)" />

      {/* 光の筋 */}
      {[25, 85, 145, 210, 275, 330].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x + 18} y2="160"
          stroke="white" strokeWidth="0.7" opacity="0.07" />
      ))}

      {/* 水草 */}
      {[18, 55, 305, 345].map((x, i) => (
        <g key={i} transform={`translate(${x},100)`}>
          <path d={`M0,60 Q${i % 2 === 0 ? -9 : 9},28 2,0`}
            stroke="#4ade80" strokeWidth="2.5" fill="none" opacity="0.65" />
          <path d={`M0,48 Q${i % 2 === 0 ? 11 : -11},26 6,8`}
            stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.45" />
        </g>
      ))}

      {/* 泡 */}
      {[38, 78, 128, 178, 238, 298, 340].map((x, i) => (
        <circle key={i} cx={x} cy={55 + (i * 14) % 75}
          r={2.5 + (i % 3)} fill="none" stroke="white" strokeWidth="0.7" opacity="0.22" />
      ))}

      {/* 幹之 */}
      <g transform="translate(58,52)" filter="url(#aq-glow)">
        <ellipse cx="0" cy="0" rx="22" ry="8" fill="#7dd3fc" opacity="0.92" />
        <path d="M-18,0 L-26,-7 L-26,7 Z" fill="#bae6fd" opacity="0.65" />
        <path d="M-20,-2 Q0,-9 22,-2" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
        <circle cx="18" cy="-2" r="3.5" fill="white" />
        <circle cx="19" cy="-2" r="2"   fill="#0c4a6e" />
      </g>

      {/* 楊貴妃 */}
      <g transform="translate(158,82)" filter="url(#aq-glow)">
        <ellipse cx="0" cy="0" rx="20" ry="7.5" fill="#fb923c" opacity="0.92" />
        <path d="M-16,0 L-23,-6 L-23,6 Z" fill="#fed7aa" opacity="0.7" />
        <circle cx="16" cy="-2" r="3.2" fill="white" />
        <circle cx="17" cy="-2" r="1.9" fill="#7c2d12" />
      </g>

      {/* 夜桜 */}
      <g transform="translate(238,50)" filter="url(#aq-glow)">
        <ellipse cx="0" cy="0" rx="18" ry="6.5" fill="#e879f9" opacity="0.88" />
        <path d="M-14,0 L-20,-5 L-20,5 Z" fill="#f0abfc" opacity="0.65" />
        <circle cx="52" cy="36" r="3" fill="#fbcfe8" opacity="0.5" />
        <path d="M-14,-1 Q0,-7 18,-1" stroke="#f0abfc" strokeWidth="1.5" fill="none" opacity="0.65" />
        <circle cx="14" cy="-1" r="3"   fill="white" />
        <circle cx="15" cy="-1" r="1.8" fill="#581c87" />
      </g>

      {/* 煌 */}
      <g transform="translate(298,96)">
        <ellipse cx="0" cy="0" rx="16" ry="6" fill="#fbbf24" opacity="0.92" />
        <path d="M-12,0 L-18,-5 L-18,5 Z" fill="#fde68a" opacity="0.65" />
        <path d="M-12,-1 Q0,-6 16,-1" stroke="#fef3c7" strokeWidth="2" fill="none" opacity="0.85" />
        <circle cx="12" cy="-1" r="2.8" fill="white" />
        <circle cx="13" cy="-1" r="1.6" fill="#78350f" />
      </g>

      {/* 底砂利 */}
      <ellipse cx="180" cy="158" rx="200" ry="10" fill="#0c4a6e" opacity="0.7" />
      {[28,68,108,148,188,228,268,308].map((x, i) => (
        <ellipse key={i} cx={x} cy={154 + (i % 3)} rx={3.5 + (i % 3)} ry="2"
          fill="#164e63" opacity="0.55" />
      ))}
    </svg>
  );
}
