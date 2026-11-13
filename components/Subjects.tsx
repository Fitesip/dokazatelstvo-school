import { COURSES } from "@/lib/data";
import { LinkButton } from "./Button";
import { CourseCard } from "./CourseCard";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Mascot } from "./ui/Mascot";
import { SectionTitle } from "./ui/SectionTitle";

/** Блок курсов на главной. */
export function Subjects() {
  return (
    <section id="subjects" className="scroll-mt-24 py-10">
      <Container className="flex flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="flex flex-col gap-3 pt-3">
            <Eyebrow large className="max-w-[420px]">
              Курсы
            </Eyebrow>
            <SectionTitle>Выберите курс</SectionTitle>
          </div>
          <div className="flex items-end gap-4 pt-3 lg:pr-[34px]">
            <p className="max-w-[420px] text-[15.5px] text-text">
              Пять программ профильного ЕГЭ — от восстановления базы до всего экзамена. В каждой три уровня
              сопровождения, оплата помесячно.
            </p>
            <Mascot name="subjects" width={104} className="w-[80px] shrink-0 sm:w-[104px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border border-card-line bg-card-line md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="flex justify-center pt-px">
          <LinkButton href="/courses">Сравнить уровни и цены →</LinkButton>
        </div>
      </Container>
    </section>
  );
}
