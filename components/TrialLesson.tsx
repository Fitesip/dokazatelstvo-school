import { TrialForm } from "./TrialForm";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { SectionTitle } from "./ui/SectionTitle";

export function TrialLesson() {
  return (
    <section id="trial" className="scroll-mt-24 border-t border-line py-16">
      <Container className="flex flex-col items-center gap-8">
        <div className="flex w-full flex-col gap-3">
          <Eyebrow>Пробный урок</Eyebrow>
          <SectionTitle className="pt-3">
            Посмотрите, как проходит занятие
          </SectionTitle>
        </div>

        {/* Заглушка под видео. Замените на <video> или iframe (YouTube / VK / Rutube) */}
        <div
          className="relative flex aspect-video w-full max-w-[860px] items-center justify-center overflow-hidden rounded-[3px] border border-accent bg-ink drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)]"
          role="img"
          aria-label="Видео пробного урока — скоро появится"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[10px] border border-gold/35"
          />
          <div className="flex flex-col items-center gap-4 px-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full border border-accent text-accent drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)] sm:size-20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-1">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
            <span className="text-sm text-text/70">
              Видео пробного урока скоро появится
            </span>
          </div>
        </div>

        <TrialForm />
      </Container>
    </section>
  );
}
