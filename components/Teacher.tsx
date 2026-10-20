import { TEACHER } from "@/lib/data";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Mascot } from "./ui/Mascot";

export function Teacher() {
  return (
    <section id="teacher" className="scroll-mt-24 py-10">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="relative">
          {/* Фото-заглушка. Замените на <Image src="/teacher.jpg" … /> */}
          <div
            className="flex aspect-[473.39/591.73] w-full items-center justify-center rounded-[3px] border border-accent bg-linear-[160deg,#d9c4a0_0%,#f6efe2_100%]"
            role="img"
            aria-label="Фото преподавателя"
          >
            <span className="px-5 text-[12.5px] text-accent">
              Фото преподавателя
            </span>
          </div>
          <Mascot
            name="teacher"
            width={140}
            className="absolute -bottom-6 -right-3 w-[104px] sm:-right-8 sm:w-[140px]"
          />
        </div>

        <div className="flex flex-col gap-1 pt-3">
          <Eyebrow className="pb-2">О преподавателе</Eyebrow>

          <blockquote className="glow-blue border-l-2 border-ember pl-[22px] text-[19px] italic leading-[29.45px] text-blue">
            {TEACHER.quote}
          </blockquote>

          <p className="glow-blue pt-6 text-[22px] font-bold text-blue">
            {TEACHER.name}
          </p>
          <p className="text-sm text-text">{TEACHER.role}</p>

          <ul className="flex flex-col gap-3 pt-5 text-[14.5px] text-text">
            {TEACHER.facts.map((fact) => (
              <li key={fact} className="flex gap-3">
                <span className="glow-red font-bold text-accent">—</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
