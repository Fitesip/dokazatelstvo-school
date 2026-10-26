import { AnswersView, type AnswerViewQuestion } from "@/components/cabinet/AnswersView";
import { FormNote } from "@/components/ui/Field";

export function HomeworkResult({
  checked,
  grade,
  comment,
  questions,
}: {
  checked: boolean;
  grade: number | null;
  comment: string | null;
  questions: AnswerViewQuestion[];
}) {
  return (
    <div className="flex flex-col gap-5">
      {checked ? (
        <div className="flex flex-col gap-2 rounded-[3px] border border-blue/60 bg-blue/10 px-5 py-4">
          <span className="text-[15px] text-text">
            Оценка: <b className="glow-blue text-[28px] text-blue">{grade}</b>
          </span>
          {comment && <p className="whitespace-pre-line text-[15px] leading-[23px] text-text/90">{comment}</p>}
        </div>
      ) : (
        <FormNote>Работа сдана и ждёт проверки. Правильные ответы и оценка появятся здесь после проверки.</FormNote>
      )}
      <AnswersView questions={questions} />
    </div>
  );
}
