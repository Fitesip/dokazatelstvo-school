import Link from "next/link";
import { NAV_ITEMS, PHONE } from "@/lib/data";
import { PrimaryButton } from "./Button";
import { Logo } from "./ui/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg backdrop-blur-[3px]">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-[18px] sm:gap-6 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="whitespace-nowrap border-b border-transparent py-1 text-[15px] text-text transition hover:border-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/cabinet"
            className="hidden whitespace-nowrap text-sm text-blue transition hover:brightness-125 lg:block"
          >
            Кабинет
          </Link>
          <a
            href={PHONE.href}
            // на xl рядом меню — телефон не помещается, он есть в футере
            className="hidden whitespace-nowrap text-sm text-text transition hover:text-blue md:block xl:hidden"
          >
            {PHONE.label}
          </a>
          <PrimaryButton href="#trial" size="sm">
            Записаться
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
