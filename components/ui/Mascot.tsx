import Image, { type StaticImageData } from "next/image";
import cta from "@/public/mascot/cta.png";
import footer from "@/public/mascot/footer.png";
import hero from "@/public/mascot/hero.png";
import principles from "@/public/mascot/principles.png";
import process from "@/public/mascot/process.png";
import subjects from "@/public/mascot/subjects.png";
import teacher from "@/public/mascot/teacher.png";

const MASCOTS = {
  hero,
  principles,
  subjects,
  process,
  teacher,
  cta,
  footer,
} satisfies Record<string, StaticImageData>;

export type MascotName = keyof typeof MASCOTS;

interface Props {
  name: MascotName;
  /** ширина в px при отрисовке; высота считается по пропорциям */
  width: number;
  className?: string;
  priority?: boolean;
}

/** Декоративный мангуст — вырезан из public/mangust.png */
export function Mascot({ name, width, className = "", priority }: Props) {
  const src = MASCOTS[name];
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={Math.round((src.height / src.width) * width)}
      sizes={`${width}px`}
      quality={90}
      priority={priority}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
