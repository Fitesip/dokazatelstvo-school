import { OutlineButton, PrimaryButton } from "./Button";
import { Container } from "./ui/Container";
import { Mascot } from "./ui/Mascot";

export function Cta() {
  return (
    <section className="border-t border-line bg-bg py-20">
      <Container className="flex flex-col items-center gap-4 text-center">
        <Mascot name="cta" width={110} className="w-[90px] sm:w-[110px]" />
        <h2 className="glow-blue text-[30px] font-bold text-blue">
          Готовы начать системную подготовку?
        </h2>
        <p className="text-base text-text">
          Первое занятие — диагностика уровня и разговор о цели по баллам.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 pt-4">
          <PrimaryButton href="#trial">Записаться на пробный урок</PrimaryButton>
          <OutlineButton href="#subjects">Посмотреть предметы</OutlineButton>
        </div>
      </Container>
    </section>
  );
}
