import { RESULTS } from "@/lib/data";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";

export function Results() {
  return (
    <section className="mt-[60px] border-y border-line bg-bg py-5">
      <Container className="grid items-center gap-10 py-3 md:grid-cols-3 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-[12.9px] pt-3 md:col-span-3 lg:col-span-1">
          <Eyebrow>Результаты</Eyebrow>
          <h2 className="glow-blue text-[26px] font-bold leading-[33.8px] text-blue">
            Цифры вместо
            <br />
            обещаний
          </h2>
        </div>

        {RESULTS.map((stat) => (
          <div
            key={stat.value}
            className="glow-line-red flex flex-col gap-2 self-stretch pb-[5px] pl-6"
          >
            <div className="glow-blue text-[40px] font-bold text-blue">
              {stat.value}
            </div>
            <p className="text-[13.5px] leading-[20.25px] text-text">
              {stat.lines.join(" ")}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
