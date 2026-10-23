"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  // корневые разделы (/cabinet, /admin) подсвечиваем только при точном совпадении
  const active = href.split("/").length <= 2 ? path === href : path.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap rounded-[3px] border-l-2 px-3 py-2 text-[15px] transition ${
        active ? "border-accent bg-white/5 font-bold text-text" : "border-transparent text-text/70 hover:text-text"
      }`}
    >
      {children}
    </Link>
  );
}
