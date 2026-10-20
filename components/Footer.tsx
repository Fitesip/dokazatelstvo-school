import Link from "next/link";
import { FOOTER_COLUMNS } from "@/lib/data";
import { Logo } from "./ui/Logo";
import { Mascot } from "./ui/Mascot";

export function Footer() {
  return (
    <footer id="contacts" className="scroll-mt-24 bg-bg">
      <div className="h-[2px] w-full bg-gradient-to-r from-accent to-teal" />

      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 sm:px-8 pb-10 pt-[60px] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-[13px]">
          <div>
            <Logo />
          </div>
          <p className="max-w-[240px] text-[13.5px] leading-[21.6px] text-text">
            Онлайн-школа подготовки к ЕГЭ и ОГЭ. Системность, понятные
            объяснения, предсказуемый результат.
          </p>
          <Mascot name="footer" width={120} className="mt-2 w-[120px]" />
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h4 className="glow-red text-[13px] font-bold uppercase tracking-[1.04px] text-accent">
              {column.title}
            </h4>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="pt-1.5 text-sm text-text transition hover:text-blue"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1180px] border-t border-line">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 px-4 sm:px-8 py-[22px] text-[12.5px] text-text">
          <span>© 2026 Доказательство. Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}
