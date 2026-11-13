import type { Metadata } from "next";
import { PrimaryButton } from "@/components/Button";
import { CourseCard } from "@/components/CourseCard";
import { SitePage } from "@/components/SitePage";
import { PriceTable, TierCards } from "@/components/TierCompare";
import { COURSES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Курсы и цены | Доказательство",
  description:
    "Пять курсов подготовки к профильному ЕГЭ по математике и три уровня сопровождения: самостоятельный, с сопровождением и персональный PRO.",
};

export default function CoursesPage() {
  return (
    <SitePage
      eyebrow="Курсы и цены"
      title="Пять курсов, три уровня сопровождения"
      intro="Выберите программу под свою цель и уровень поддержки: от самостоятельной работы с материалами до личной стратегии и созвонов с преподавателем. Оплата помесячно."
    >
      <section className="flex flex-col gap-5">
        <h2 className="glow-blue text-[26px] font-bold text-blue">Курсы</h2>
        <div className="grid grid-cols-1 gap-px border border-card-line bg-card-line md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section id="tiers" className="flex scroll-mt-24 flex-col gap-5">
        <h2 className="glow-blue text-[26px] font-bold text-blue">Уровни сопровождения</h2>
        <TierCards />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="glow-blue text-[26px] font-bold text-blue">Все цены за месяц</h2>
        <PriceTable />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <PrimaryButton href="/#trial">Записаться на пробный урок</PrimaryButton>
        <span className="text-[14px] text-text/70">Поможем выбрать курс и уровень на первом занятии.</span>
      </div>
    </SitePage>
  );
}
