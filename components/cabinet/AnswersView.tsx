import type { QuestionKind } from "@/lib/db/schema";

export interface AnswerViewQuestion {
  id: string;
  kind: QuestionKind;
  text: string;
  images: string[];
  options: { id: string; text: string }[];
  given: { optionIds: string[]; text: string };
  files: { id: string; name: string; mime: string; size: number }[];
  /** null — не показываем (ещё не проверено) или вопрос с ручной проверкой */
  autoCorrect: boolean | null;
  correctOptionIds: string[];
  accepted: string[];
}

/** Ответы ученика по вопросам. Правильные ответы — только если они переданы (после проверки / для преподавателя). */
export function AnswersView({ questions }: { questions: AnswerViewQuestion[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {questions.map((q, i) => (
        <li key={q.id} className="flex flex-col gap-3 rounded-[3px] border border-card-line bg-ink/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="glow-blue text-[18px] font-bold text-blue">Вопрос {i + 1}</h3>
            {q.autoCorrect === true && <span className="text-[14px] font-bold text-green">✓ верно</span>}
            {q.autoCorrect === false && <span className="text-[14px] font-bold text-accent">✕ неверно</span>}
            {q.kind === "long" && <span className="text-[13px] text-text/50">проверка вручную</span>}
          </div>
          {q.text && <p className="whitespace-pre-line text-[15px] leading-[24px] text-text">{q.text}</p>}
          {q.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {q.images.map((fid) => (
                // eslint-disable-next-line @next/next/no-img-element -- файлы отдаются с проверкой доступа
                <img key={fid} src={`/files/${fid}`} alt="" className="max-h-56 w-auto max-w-full rounded-[3px] bg-white object-contain" />
              ))}
            </div>
          )}

          {q.kind === "choice" && (
            <ul className="flex flex-col gap-1.5">
              {q.options.map((o) => {
                const chosen = q.given.optionIds.includes(o.id);
                const correct = q.correctOptionIds.includes(o.id);
                return (
                  <li
                    key={o.id}
                    className={`flex items-center gap-3 rounded-[3px] border px-3 py-2 text-[15px] ${
                      correct ? "border-green" : chosen ? "border-blue" : "border-card-line"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center">{chosen ? "●" : "○"}</span>
                    <span className="flex-1">{o.text}</span>
                    {correct && <span className="text-[12px] text-green">правильный</span>}
                  </li>
                );
              })}
            </ul>
          )}

          {q.kind === "short" && (
            <div className="flex flex-col gap-1 text-[15px]">
              <span>
                Ответ: <b>{q.given.text || <span className="text-text/40">нет ответа</span>}</b>
              </span>
              {q.accepted.length > 0 && <span className="text-green">Правильный ответ: {q.accepted.join(" или ")}</span>}
            </div>
          )}

          {q.kind === "long" && (
            <div className="flex flex-col gap-2 text-[15px]">
              {q.files.length === 0 && <span className="text-text/40">Файлы не прикреплены</span>}
              {q.files.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {q.files.map((f) =>
                    f.mime.startsWith("image/") && f.mime !== "image/heic" ? (
                      <a key={f.id} href={`/files/${f.id}`} target="_blank" rel="noreferrer" title={f.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаются с проверкой доступа */}
                        <img src={`/files/${f.id}`} alt={f.name} className="h-40 w-auto rounded-[3px] border border-card-line object-contain" />
                      </a>
                    ) : (
                      <a
                        key={f.id}
                        href={`/files/${f.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-40 w-32 flex-col items-center justify-center gap-2 rounded-[3px] border border-card-line px-2 text-center text-[13px] text-blue hover:border-blue"
                      >
                        <b>{f.mime === "application/pdf" ? "PDF" : "HEIC"}</b>
                        <span className="line-clamp-3 break-all text-text/70">{f.name}</span>
                      </a>
                    ),
                  )}
                </div>
              )}
              {q.given.text && <p className="whitespace-pre-line text-text/80">Комментарий: {q.given.text}</p>}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
