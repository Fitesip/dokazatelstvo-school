"use client";

import { useActionState } from "react";
import { gradeAction, type GradeState } from "@/app/actions/admin";
import { PrimarySubmit } from "@/components/Button";
import { FormError } from "@/components/ui/Field";

/** Оценка по 5-балльной шкале и комментарий. Можно исправить уже выставленную. */
export function GradeForm({ id, grade, comment, checked }: { id: string; grade: number | null; comment: string; checked: boolean }) {
  const [state, action, pending] = useActionState<GradeState, FormData>(gradeAction, {});

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[3px] border border-accent/60 bg-ink/60 p-5">
      <input type="hidden" name="id" value={id} />
      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-[16px] font-bold text-text">{checked ? "Изменить оценку" : "Оценка"}</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((g) => (
            <label key={g} className="cursor-pointer">
              <input type="radio" name="grade" value={g} defaultChecked={grade === g} required className="peer sr-only" />
              <span className="flex size-12 items-center justify-center rounded-[3px] border border-card-line text-[20px] font-bold text-text transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-blue hover:border-accent">
                {g}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-text">Комментарий для ученика (необязательно)</span>
        <textarea
          name="comment"
          defaultValue={comment}
          rows={4}
          placeholder="Что получилось, где ошибка и как исправить"
          className="resize-y rounded-[3px] border border-card-line bg-bg px-4 py-3 text-[15px] leading-[22px] text-text outline-none focus:border-blue"
        />
      </label>
      <FormError>{state.error}</FormError>
      <PrimarySubmit type="submit" disabled={pending} className="self-start">
        {pending ? "Сохраняем…" : checked ? "Сохранить оценку" : "Выставить оценку"}
      </PrimarySubmit>
    </form>
  );
}
