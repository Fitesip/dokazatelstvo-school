import { PRINCIPLES } from "@/lib/data";
import { PrincipleIconSvg } from "./PrincipleIcons";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Mascot } from "./ui/Mascot";
import { SectionTitle } from "./ui/SectionTitle";

export function Principles() {
  return (
    <section className="border-y border-line bg-bg py-5">
      <Container className="flex flex-col gap-3">
        <Eyebrow>Принципы</Eyebrow>

        <div className="flex flex-wrap items-end justify-between gap-x-8">
          <SectionTitle className="pt-3">Почему мы</SectionTitle>
          <div className="flex items-end gap-4 pt-3 lg:pr-[45px]">
            <p className="max-w-[420px] text-[15.5px] text-text">
              Мы убрали из подготовки всё, что не влияет на балл на экзамене.
            </p>
            <Mascot name="principles" width={64} className="-mt-12 w-[52px] shrink-0 sm:w-[64px]" />
          </div>
        </div>

        <div className="grid items-stretch gap-y-6 pt-[25px] sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item) => (
            <article
              key={item.title}
              className="glow-line-red flex flex-col gap-2.5 pb-6 pl-[22px] pr-[26px] pt-[15px]"
            >
              <div className="flex size-[34px] items-center justify-center rounded-full bg-ink text-accent">
                <PrincipleIconSvg name={item.icon} />
              </div>
              <h3 className="glow-blue pt-2.5 text-lg font-bold text-blue">
                {item.title}
              </h3>
              <p className="text-[14.5px] leading-[23.2px] text-text">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
