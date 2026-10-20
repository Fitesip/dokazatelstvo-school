import Link from "next/link";
import type { Subject } from "@/lib/data";

export function SubjectCard({ subject }: { subject: Subject }) {
  const isEge = subject.exam === "ЕГЭ";

  return (
    <article className="flex min-h-[250px] flex-col gap-[8.8px] bg-card px-7 py-[30px]">
      <div className="flex items-stretch gap-2">
        <span
          className={`rounded-[2px] border px-[9px] py-1 text-[11px] tracking-[0.33px] text-blue ${
            isEge
              ? "border-accent bg-ink drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)]"
              : "glow-blue border-card-line"
          }`}
        >
          {subject.exam}
        </span>
        <span className="rounded-[2px] border border-card-line px-[9px] py-1 text-[11px] tracking-[0.33px] text-text">
          {subject.format}
        </span>
      </div>

      <h3 className="glow-blue pt-[9.2px] text-xl font-bold text-blue">
        {subject.title}
      </h3>

      <p className="min-h-[44px] pb-[12.355px] text-sm leading-[21.7px] text-text">
        {subject.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-card-line pt-4">
        <p className="flex items-center gap-px whitespace-nowrap">
          <span className="text-[13px] text-text">от&nbsp;</span>
          <span className="glow-blue text-base font-bold text-blue">
            {subject.price}
          </span>
          <span className="text-[13px] text-text">{subject.unit}</span>
        </p>
        <Link
          href={subject.href}
          className="glow-red whitespace-nowrap text-[13.5px] font-bold text-accent transition hover:brightness-125"
        >
          Подробнее →
        </Link>
      </div>
    </article>
  );
}
