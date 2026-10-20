import { STEPS } from "@/lib/data";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Mascot } from "./ui/Mascot";
import { SectionTitle } from "./ui/SectionTitle";

export function Process() {
  return (
    <section className="mt-[60px] border-y border-line bg-bg py-5">
      <Container className="flex flex-col gap-3">
        <Eyebrow>Как проходит обучение</Eyebrow>
        <SectionTitle className="pt-3">Путь от диагностики до экзамена</SectionTitle>

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <ol className="flex flex-col pt-10">
            {STEPS.map((step, i) => (
              <li
                key={step.number}
                className={`flex items-start gap-6 py-[26px] first:pt-0 ${
                  i === STEPS.length - 1 ? "" : "border-b border-line"
                }`}
              >
                <div className="relative z-10 flex size-[60px] shrink-0 items-center justify-center rounded-full border border-accent bg-ink text-xl text-accent drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)]">
                  {step.number}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
                  <h3 className="glow-blue text-[19px] font-bold text-blue">
                    {step.title}
                  </h3>
                  <p className="max-w-[560px] text-[14.5px] leading-[23.2px] text-text">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Mascot
            name="process"
            width={260}
            className="hidden w-[200px] lg:block xl:w-[260px]"
          />
        </div>
      </Container>
    </section>
  );
}
