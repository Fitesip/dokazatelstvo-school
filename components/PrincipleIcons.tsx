import type { PrincipleIcon } from "@/lib/data";

const PATHS: Record<PrincipleIcon, React.ReactNode> = {
  plus: <path d="M8 3v10M3 8h10" />,
  square: <rect x="3" y="3" width="10" height="10" />,
  pulse: <path d="M1.5 9 4.5 5.5 7.5 10.5 10 6.5l4.5 3" />,
  circle: <circle cx="8" cy="8" r="5" />,
};

interface Props {
  name: PrincipleIcon;
  className?: string;
}

/**
 * Иконки нарисованы вручную по макету (оригинальные SVG из Figma
 * не удалось скачать). При желании замените на экспорт из Figma.
 */
export function PrincipleIconSvg({ name, className = "" }: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
