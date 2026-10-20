import { SUBJECTS } from "@/lib/data";
import { LinkButton } from "./Button";
import { SubjectCard } from "./SubjectCard";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Mascot } from "./ui/Mascot";
import { SectionTitle } from "./ui/SectionTitle";

export function Subjects() {
  return (
    <section id="subjects" className="scroll-mt-24 py-10">
      <Container className="flex flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="flex flex-col gap-3 pt-3">
            <Eyebrow large className="max-w-[420px]">
              Предметы и курсы
            </Eyebrow>
            <SectionTitle>Выберите предмет</SectionTitle>
          </div>
          <div className="flex items-end gap-4 pt-3 lg:pr-[34px]">
            <p className="max-w-[420px] text-[15.5px] text-text">
              Группы и индивидуальные занятия, ЕГЭ и ОГЭ, базовый и профильный
              уровень.
            </p>
            <Mascot name="subjects" width={104} className="w-[80px] shrink-0 sm:w-[104px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border border-card-line bg-card-line md:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.title} subject={subject} />
          ))}
        </div>

        <div className="flex justify-center pt-px">
          <LinkButton href="#subjects">Смотреть все предметы →</LinkButton>
        </div>
      </Container>
    </section>
  );
}
