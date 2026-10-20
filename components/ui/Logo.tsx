import Image from "next/image";
import Link from "next/link";
import mark from "@/public/logo-mark.png";

/** «Д[мангуст]казательство» — мангуст-выпускник в кружке вместо буквы «о» */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Доказательство — на главную"
      className="glow-blue inline-flex items-center whitespace-nowrap text-[clamp(19px,5.8vw,26px)] font-bold leading-none text-blue transition hover:brightness-125 sm:text-[21px]"
    >
      <span aria-hidden>Д</span>
      <span
        aria-hidden
        className="mx-[0.03em] inline-block size-[1.12em] shrink-0 translate-y-[0.04em] overflow-hidden rounded-full border-[1.5px] border-accent bg-ink shadow-[0_0_10px_rgb(230_57_70/0.55)]"
      >
        <Image
          src={mark}
          alt=""
          width={32}
          height={32}
          sizes="32px"
          quality={90}
          priority
          className="size-full"
        />
      </span>
      <span aria-hidden>казательство</span>
    </Link>
  );
}
