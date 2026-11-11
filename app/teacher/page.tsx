import type { Metadata } from "next";
import { PrimaryButton } from "@/components/Button";
import { FactList, SitePage } from "@/components/SitePage";
import { Mascot } from "@/components/ui/Mascot";
import { TEACHER, TEACHER_PAGE } from "@/lib/data";

export const metadata: Metadata = {
  title: `${TEACHER.name} — преподаватель | Доказательство`,
  description: TEACHER_PAGE.intro,
};

export default function TeacherPage() {
  const { sections, method } = TEACHER_PAGE;
  return (
    <SitePage eyebrow="О преподавателе" title={TEACHER.name} intro={TEACHER_PAGE.intro}>
      <blockquote className="glow-blue max-w-[760px] border-l-2 border-ember pl-[22px] text-[19px] italic leading-[29.45px] text-blue">
        {TEACHER.quote}
      </blockquote>

      <div className="grid gap-10 md:grid-cols-2">
        {sections.map((s) => (
          <FactList key={s.title} title={s.title} items={s.items} />
        ))}
      </div>

      <section className="flex max-w-[760px] flex-col gap-4">
        <h2 className="glow-blue text-[24px] font-bold text-blue">{method.title}</h2>
        <p className="text-[16px] leading-[26px] text-text">{method.text}</p>
        <ul className="flex flex-col gap-3 text-[15px] leading-[24px] text-text">
          {method.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="glow-red font-bold text-accent">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-end gap-6">
        <PrimaryButton href="/#trial">Записаться на пробный урок</PrimaryButton>
        <Mascot name="teacher" width={110} className="w-[110px]" />
      </div>
    </SitePage>
  );
}
