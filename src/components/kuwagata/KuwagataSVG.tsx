import { cn } from "@/lib/utils";
import { speciesGradient } from "@/lib/kuwagataUtils";

interface KuwagataSVGProps {
  size?: number;
  color?: string;
  className?: string;
}

/** クワガタのシルエット (上面図)。左半身を定義して右側にミラー */
export function KuwagataSVG({ size = 48, color = "currentColor", className }: KuwagataSVGProps) {
  const half = (
    <g>
      {/* 大顎 */}
      <path d="M46 30 C40 18 34 10 26 7 C22 5.5 18 6 16 8 C21 9 26 13 29 18 L26 19 C29 22 32 24 34 28 L31 29 C35 32 39 34 44 36 Z" />
      {/* 触角 */}
      <path d="M38 32 C33 28 27 26 21 26 C19 26 17.5 27 17 28.5 C22 28.5 28 30 33 34 Z" opacity="0.85" />
      {/* 前脚 */}
      <path d="M40 46 C32 44 24 44 17 48 C15 49 14.5 51 15.5 52.5 C22 49.5 31 49 39 50 Z" opacity="0.9" />
      {/* 中脚 */}
      <path d="M41 58 C32 58 23 60 16 66 C14.5 67.5 14.5 69.5 16 70.5 C23 65.5 32 63 40 62.5 Z" opacity="0.9" />
      {/* 後脚 */}
      <path d="M42 70 C34 72 26 76 21 83 C20 84.5 20.5 86.5 22 87 C27.5 81 35 77 42 75 Z" opacity="0.9" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      className={className}
      aria-hidden="true"
    >
      {half}
      <g transform="scale(-1,1) translate(-100,0)">{half}</g>
      {/* 頭部 */}
      <path d="M50 26 C44 26 40 30 40 35 L40 40 C40 42 44 44 50 44 C56 44 60 42 60 40 L60 35 C60 30 56 26 50 26 Z" />
      {/* 前胸 */}
      <path d="M50 42 C42 42 37 45 36.5 50 C36 55 40 58 50 58 C60 58 64 55 63.5 50 C63 45 58 42 50 42 Z" />
      {/* 上翅 */}
      <path d="M50 56 C41 56 35.5 61 35.5 69 C35.5 81 41 92 50 94 C59 92 64.5 81 64.5 69 C64.5 61 59 56 50 56 Z" />
      {/* 上翅の合わせ目 */}
      <line x1="50" y1="58" x2="50" y2="92" stroke="#fbf7ef" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

interface SpeciesAvatarProps {
  species: string;
  size?: "md" | "lg";
  className?: string;
}

/** 種類別カラーのグラデーション背景にクワガタシルエットを載せたアバター */
export function SpeciesAvatar({ species, size = "md", className }: SpeciesAvatarProps) {
  const dims = size === "lg" ? "w-14 h-14 rounded-2xl" : "w-11 h-11 rounded-xl";
  const svgSize = size === "lg" ? 40 : 32;
  return (
    <div
      className={cn(
        dims,
        "bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
        speciesGradient(species),
        className
      )}
    >
      <KuwagataSVG size={svgSize} color="rgba(255,244,214,0.92)" />
    </div>
  );
}
