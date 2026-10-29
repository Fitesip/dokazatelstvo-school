"use client";

import { useActionState, useEffect, useState } from "react";
import { startLessonAction, type StartLessonState } from "@/app/actions/admin";

/** «Начать урок» → поле для ссылки на звонок (подставлена ссылка с прошлого урока) → «Начать». */
export function StartLessonForm({ productId, lastUrl }: { productId: string; lastUrl: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<StartLessonState, FormData>(startLessonAction, {});
  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[3px] bg-accent px-3 py-1.5 text-[14px] font-bold text-ink drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)] transition hover:brightness-110"
      >
        Начать урок
      </button>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-[560px] flex-col gap-2">
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] text-text/70">Ссылка на звонок — ученики перейдут по ней кнопкой «Зайти в звонок»</span>
        <input
          name="callUrl"
          type="text"
          autoComplete="off"
          inputMode="url"
          required
          autoFocus
          defaultValue={lastUrl}
          placeholder="https://telemost.yandex.ru/j/…"
          className="rounded-[3px] border border-card-line bg-bg px-3 py-2 text-[14px] text-text outline-none focus:border-blue"
        />
      </label>
      {state.error && <p className="text-[13px] text-accent">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-[3px] bg-accent px-3 py-1.5 text-[14px] font-bold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Начинаем…" : "Начать"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-[3px] border border-card-line px-3 py-1.5 text-[14px] text-text transition hover:border-blue"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
