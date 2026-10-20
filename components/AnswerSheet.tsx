import { ANSWER_ROWS, OPTIONS, type AnswerColor } from "@/lib/data";

const SELECTED_STYLES: Record<AnswerColor, string> = {
  red: "border-accent bg-accent text-ink",
  green: "border-green bg-green text-ink",
};

const IDLE_STYLES = "border-blue text-blue";

export function AnswerSheet() {
  return (
    <div className="relative w-full max-w-[470px] rotate-[1.2deg] rounded-[3px] border border-t-[3px] border-accent bg-ink px-[26px] pb-6 pt-7 drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)]">
      {/* overlay shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-px -bottom-px -top-[3px] rounded-[3px] shadow-[0_24px_48px_-20px_rgb(51_53_46/0.16)]"
      />

      {/* header */}
      <div className="flex items-start justify-between border-b border-dashed border-line-dashed pb-[14px]">
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <div className="glow-blue text-[15px] font-bold text-blue">
            Бланк ответов № 1
          </div>
          <div className="text-[11px] text-text">
            Профильная математика · вариант 14
          </div>
        </div>
        <div className="pt-0.5">
          <div className="rounded-[2px] bg-ink-soft px-2 py-1 text-[11px] font-bold uppercase tracking-[0.66px] text-text">
            Разбор ДЗ
          </div>
        </div>
      </div>

      {/* rows */}
      <div className="mt-[11px] flex flex-col gap-[11px] pt-[7px]">
        {ANSWER_ROWS.map((row) => (
          <div key={row.number} className="flex items-center gap-[14px]">
            <div className="w-4 text-[12px] text-text">{row.number}</div>
            <div className="flex gap-[7px]">
              {OPTIONS.map((option, idx) => (
                <div
                  key={option}
                  className={`flex size-[19px] items-center justify-center rounded-full border text-[9px] ${
                    idx === row.selected
                      ? SELECTED_STYLES[row.color]
                      : IDLE_STYLES
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="mt-[11px] flex items-start justify-between border-t border-dashed border-line-dashed pt-[14px] text-[11px] text-text">
        <span>Проверено преподавателем</span>
        <span>Ошибок: 1 из 4</span>
      </div>

      {/* inner gold frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10px] border border-gold/35"
      />
    </div>
  );
}
