import Link from "next/link";
import { rub, type Course } from "@/lib/data";

/** Карточка курса: название, о чём курс, цена от самостоятельного уровня. */
export function CourseCard({ course }: { course: Course }) {
  return (
    <article id={course.id} className="flex min-h-[250px] scroll-mt-24 flex-col gap-2 bg-card px-7 py-[30px]">
      <span className="text-[12px] font-bold uppercase tracking-wide text-accent">{course.subtitle}</span>
      <h3 className="glow-blue pt-1 text-[24px] font-bold text-blue">{course.title}</h3>
      <p className="pb-3 text-sm leading-[21.7px] text-text">{course.description}</p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-card-line pt-4">
        <p className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-[13px] text-text">от</span>
          <span className="glow-blue text-base font-bold text-blue">{rub(course.prices.self)}</span>
          <span className="text-[13px] text-text">/мес</span>
        </p>
        <Link
          href="/courses#tiers"
          className="glow-red whitespace-nowrap text-[13.5px] font-bold text-accent transition hover:brightness-125"
        >
          Уровни →
        </Link>
      </div>
    </article>
  );
}
