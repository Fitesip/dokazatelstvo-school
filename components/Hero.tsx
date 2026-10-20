import { AnswerSheet } from "./AnswerSheet";
import { LinkButton, PrimaryButton } from "./Button";
import { StatsRow } from "./StatsRow";
import { Mascot } from "./ui/Mascot";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-[1180px] items-center gap-12 px-4 sm:px-8 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-[88px]">
      {/* left column */}
      <div className="flex flex-col items-start gap-[21.3px] lg:pl-10 lg:pt-3">
        <div className="flex w-full items-center gap-2.5">
          <span className="h-px w-[18px] bg-accent shadow-[0_0_15px_rgb(230_57_70/0.5)]" />
          <span className="glow-red text-xs font-bold uppercase tracking-[1.68px] text-accent">
            ЕГЭ · ОГЭ · подготовка к 2027
          </span>
        </div>

        <h1 className="w-full pb-[0.535px] text-[32px] font-bold leading-[1.18] tracking-[-0.46px] text-text sm:text-[46px] sm:leading-[54.28px]">
          Подготовка к ЕГЭ и ОГЭ:{" "}
          <span className="glow-red text-accent">системно</span>, без лишней
          суеты
        </h1>

        <p className="max-w-[480px] pt-[1.885px] text-[17px] leading-[27.2px] text-text">
          Понятные объяснения, регулярные домашние задания, разбор ошибок.
          Никаких мемов и шоу — только методика и предсказуемый результат.
        </p>

        <div className="flex w-full flex-wrap items-center gap-x-7 gap-y-4 pb-[22.7px] pt-[14.7px]">
          <PrimaryButton href="#subjects">Выбрать предмет</PrimaryButton>
          <LinkButton href="#trial">Записаться на пробный урок →</LinkButton>
        </div>

        <StatsRow />
      </div>

      {/* right column */}
      <div className="flex items-center justify-center pb-8 pt-32 sm:pt-40 lg:h-[326px] lg:py-8">
        <div className="w-full rotate-[5.19deg]">
          <div className="flex justify-center">
            <div className="relative w-full max-w-[470px]">
              <Mascot
                name="hero"
                width={84}
                priority
                className="absolute bottom-[calc(100%-6px)] right-6 w-[64px] sm:w-[84px]"
              />
              <AnswerSheet />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
