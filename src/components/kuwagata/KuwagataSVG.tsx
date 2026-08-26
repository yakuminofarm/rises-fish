import { cn } from "@/lib/utils";
import { speciesGradient } from "@/lib/kuwagataUtils";

/**
 * フラットデザインのクワガタ (正面顔)。
 * 輪郭線・グラデーション・影を使わず、ベタ塗りの面だけで形を作る。
 *
 * 上面図も試作したが 34px まで縮めると脚と触角が線に潰れて蚊のように見えたため、
 * 大顎が主役になる正面顔に統一している。種類の違いは背景タイルの色で表す。
 */

interface BeetleProps {
  size?: number;
  /** 体の色 */
  color?: string;
  /** 目の抜き色。背景タイルと同色にすると切り抜いて見える */
  cut?: string;
  className?: string;
}

const MANDIBLE =
  "M41 70 C26 65 14 51 16 34 C17.5 22 24 14 33 11 " +
  "C30 20 29 29 31 37 L41 34 C37 43 36 50 38 56 C40 62 44 67 48 70 Z";

export function KuwagataSVG({
  size = 48,
  color = "#3d2b1c",
  cut = "#f0d49b",
  className,
}: BeetleProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <g fill={color}>
        {/* 大顎 (左右対称) */}
        <path d={MANDIBLE} />
        <g transform="scale(-1,1) translate(-100,0)">
          <path d={MANDIBLE} />
        </g>
        {/* 触角 */}
        <path d="M36 66 C28 64 21 66 16 71 C13.5 73.5 13 76 14.5 77.5 C19 73 26 71 33 72 Z" />
        <path d="M64 66 C72 64 79 66 84 71 C86.5 73.5 87 76 85.5 77.5 C81 73 74 71 67 72 Z" />
        {/* 頭 */}
        <path d="M50 58 C42 58 37 62 37 68 C37 73 42 76 50 76 C58 76 63 73 63 68 C63 62 58 58 50 58 Z" />
        {/* 前胸 (幅広の角丸台形) */}
        <path d="M31 73 L69 73 C75 73 79 77 79 83 L79 90 C79 95 75 98 69 98 L31 98 C25 98 21 95 21 90 L21 83 C21 77 25 73 31 73 Z" />
      </g>
      <circle cx="41" cy="67" r="3.2" fill={cut} />
      <circle cx="59" cy="67" r="3.2" fill={cut} />
    </svg>
  );
}

/** 別名 (アプリアイコン用途で意図が分かるように) */
export const KuwagataFaceSVG = KuwagataSVG;

interface SpeciesAvatarProps {
  species: string;
  size?: "md" | "lg";
  className?: string;
}

/** 種類別カラーのタイルに、フラットなクワガタを載せたアバター */
export function SpeciesAvatar({ species, size = "md", className }: SpeciesAvatarProps) {
  const dims = size === "lg" ? "w-14 h-14 rounded-2xl" : "w-11 h-11 rounded-xl";
  const svgSize = size === "lg" ? 44 : 36;
  return (
    <div
      className={cn(
        dims,
        "bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden",
        speciesGradient(species),
        className
      )}
    >
      <div style={{ marginBottom: -svgSize * 0.12 }}>
        <KuwagataSVG size={svgSize} color="#f3e3c4" cut="rgba(0,0,0,0.4)" />
      </div>
    </div>
  );
}

/** ヘッダーのアプリアイコン */
export function KuwaAppIcon({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size, background: "var(--kuwa-amber-soft)" }}
    >
      <div style={{ marginBottom: -size * 0.09 }}>
        <KuwagataSVG size={Math.round(size * 0.84)} color="#3d2b1c" cut="#f0d49b" />
      </div>
    </div>
  );
}
