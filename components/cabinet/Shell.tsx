import Link from "next/link";
import { Logo } from "../ui/Logo";
import { NavLink } from "./NavLink";
import { SignOutButton } from "./SignOutButton";

export interface NavItem {
  href: string;
  label: string;
}

/** Общая оболочка кабинета ученика и админки: шапка, меню слева, контент. */
export function Shell({
  nav,
  userName,
  extra,
  children,
}: {
  nav: NavItem[];
  userName: string;
  extra?: NavItem;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-[3px]">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-[14px] text-text/70 sm:block">{userName}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <nav aria-label="Разделы кабинета" className="flex gap-1 overflow-x-auto lg:flex-col">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {extra && (
            <Link
              href={extra.href}
              className="whitespace-nowrap rounded-[3px] px-3 py-2 text-[15px] text-text/60 transition hover:text-blue lg:mt-4 lg:border-t lg:border-card-line lg:pt-4"
            >
              {extra.label}
            </Link>
          )}
        </nav>
        <main className="flex min-w-0 flex-col gap-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="glow-blue text-[28px] font-bold leading-tight text-blue">{children}</h1>
      {subtitle && <p className="text-[15px] text-text/70">{subtitle}</p>}
    </div>
  );
}
