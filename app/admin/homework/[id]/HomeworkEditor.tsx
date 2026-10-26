"use client";

import { useState, useTransition } from "react";
import { deleteAssignmentAction, publishAssignmentAction, saveAssignmentAction } from "@/app/actions/admin";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError, FormNote } from "@/components/ui/Field";
import {
  validateForPublish,
  type EditorAssignment,
  type EditorOption,
  type EditorQuestion,
} from "@/lib/homework-shared";
import type { QuestionKind } from "@/lib/db/schema";
import { uploadFile } from "@/lib/upload-client";

const KINDS: Record<QuestionKind, { label: string; hint: string }> = {
  choice: { label: "Выбор варианта", hint: "Ученик отмечает вариант. Можно отметить несколько правильных." },
  short: { label: "Короткий ответ", hint: "Ученик вписывает ответ. Проверяется автоматически, без учёта пробелов и «0,5 = 0.5»." },
  long: { label: "Развёрнутое решение", hint: "Ученик загружает фото или PDF решения — проверяете вручную." },
};

const uid = () => crypto.randomUUID();
const newOption = (): EditorOption => ({ id: uid(), text: "", correct: false });
const newQuestion = (kind: QuestionKind): EditorQuestion => ({
  id: uid(),
  kind,
  text: "",
  accepted: kind === "short" ? [""] : [],
  options: kind === "choice" ? [newOption(), newOption()] : [],
  images: [],
});

export function HomeworkEditor({
  id,
  initial,
  published,
  locked,
}: {
  id: string;
  initial: EditorAssignment;
  published: boolean;
  locked: boolean;
}) {
  const [data, setData] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string>();
  const [note, setNote] = useState<string>();
  const [pending, start] = useTransition();
  const problems = validateForPublish(data);

  const update = (patch: Partial<EditorAssignment>) => {
    setData((d) => ({ ...d, ...patch }));
    setDirty(true);
    setNote(undefined);
  };
  const updateQ = (qid: string, patch: Partial<EditorQuestion>) =>
    update({ questions: data.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) });
  const move = (i: number, d: -1 | 1) => {
    const qs = [...data.questions];
    [qs[i], qs[i + d]] = [qs[i + d], qs[i]];
    update({ questions: qs });
  };

  const run = (fn: () => Promise<{ error?: string } | void>, ok: string) =>
    start(async () => {
      setError(undefined);
      const res = await fn();
      if (res?.error) return setError(res.error);
      setDirty(false);
      setNote(ok);
    });

  const save = () => run(() => saveAssignmentAction(id, data), "Сохранено.");
  const togglePublish = () =>
    run(async () => {
      if (!published) {
        const saved = await saveAssignmentAction(id, data);
        if (saved.error) return saved;
      }
      return publishAssignmentAction(id, !published);
    }, published ? "Снято с публикации." : "Опубликовано — ученики курса уже видят ДЗ.");

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-2">
        <span className={`text-[12px] font-bold uppercase tracking-wide ${published ? "text-green" : "text-text/50"}`}>
          {published ? "опубликовано" : "черновик"}
        </span>
        <Field label="Название" value={data.title} onChange={(e) => update({ title: e.target.value })} />
      </div>
      <TextArea label="Описание (необязательно)" value={data.description} onChange={(v) => update({ description: v })} />
      <div className="max-w-[240px]">
        <Field label="Срок сдачи (необязательно)" type="date" value={data.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
      </div>

      {locked && (
        <FormNote>
          Ученики уже сдают это ДЗ, поэтому вопросы зафиксированы. Можно менять название, описание и срок.
        </FormNote>
      )}

      <ol className="flex flex-col gap-4">
        {data.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            total={data.questions.length}
            locked={locked}
            onChange={(patch) => updateQ(q.id, patch)}
            onMove={(d) => move(i, d)}
            onRemove={() => update({ questions: data.questions.filter((x) => x.id !== q.id) })}
            onError={setError}
          />
        ))}
      </ol>

      {!locked && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-text/60">Добавить вопрос:</span>
          {(Object.keys(KINDS) as QuestionKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => update({ questions: [...data.questions, newQuestion(k)] })}
              className="cursor-pointer rounded-[3px] border border-card-line px-3 py-1.5 text-[14px] text-blue transition hover:border-blue"
            >
              + {KINDS[k].label}
            </button>
          ))}
        </div>
      )}

      {!published && problems.length > 0 && data.questions.length > 0 && (
        <div className="text-[13px] text-text/60">
          До публикации нужно исправить:
          <ul className="mt-1 list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* нижняя панель с действиями */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-card-line bg-bg/95 backdrop-blur-[3px]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
          <PrimarySubmit type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? "Сохраняем…" : "Сохранить"}
          </PrimarySubmit>
          <button
            type="button"
            onClick={togglePublish}
            disabled={pending || (!published && problems.length > 0) || (published && locked)}
            title={published && locked ? "Ученики уже сдали работы" : undefined}
            className="cursor-pointer rounded-[3px] border border-card-line px-4 py-[9px] text-[14px] font-bold text-blue transition hover:border-blue disabled:cursor-default disabled:opacity-40"
          >
            {published ? "Снять с публикации" : "Опубликовать"}
          </button>
          <span className="text-[13px] text-text/60" role="status">
            {error ? "" : note ?? (dirty ? "Есть несохранённые изменения" : "")}
          </span>
          {!locked && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Удалить это ДЗ? Отменить будет нельзя.")) run(() => deleteAssignmentAction(id), "");
              }}
              className="ml-auto cursor-pointer text-[13px] text-accent underline-offset-4 hover:underline"
            >
              Удалить ДЗ
            </button>
          )}
        </div>
        {error && (
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-3 sm:px-8">
            <FormError>{error}</FormError>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  index,
  total,
  locked,
  onChange,
  onMove,
  onRemove,
  onError,
}: {
  q: EditorQuestion;
  index: number;
  total: number;
  locked: boolean;
  onChange: (patch: Partial<EditorQuestion>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const ids = [...q.images];
    for (const f of Array.from(files)) {
      const res = await uploadFile(f, "question");
      if ("error" in res) onError(`${f.name}: ${res.error}`);
      else ids.push(res.id);
    }
    onChange({ images: ids });
    setUploading(false);
  }

  const setOption = (oid: string, patch: Partial<EditorOption>) =>
    onChange({ options: q.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)) });

  return (
    <li className="flex flex-col gap-4 rounded-[3px] border border-card-line bg-ink/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="glow-blue text-[18px] font-bold text-blue">Вопрос {index + 1}</span>
          <select
            value={q.kind}
            disabled={locked}
            onChange={(e) => {
              const kind = e.target.value as QuestionKind;
              const fresh = newQuestion(kind);
              onChange({ kind, accepted: fresh.accepted, options: fresh.options });
            }}
            aria-label="Тип ответа"
            className="rounded-[3px] border border-card-line bg-bg px-2 py-1.5 text-[14px] text-text"
          >
            {(Object.keys(KINDS) as QuestionKind[]).map((k) => (
              <option key={k} value={k}>
                {KINDS[k].label}
              </option>
            ))}
          </select>
        </div>
        {!locked && (
          <div className="flex items-center gap-1">
            <IconBtn label="Выше" disabled={index === 0} onClick={() => onMove(-1)}>↑</IconBtn>
            <IconBtn label="Ниже" disabled={index === total - 1} onClick={() => onMove(1)}>↓</IconBtn>
            <IconBtn label="Удалить вопрос" onClick={onRemove}>✕</IconBtn>
          </div>
        )}
      </div>
      <p className="text-[12px] text-text/50">{KINDS[q.kind].hint}</p>

      <TextArea label="Текст вопроса" value={q.text} disabled={locked} onChange={(v) => onChange({ text: v })} />

      {/* картинки */}
      <div className="flex flex-wrap items-start gap-3">
        {q.images.map((fid) => (
          <div key={fid} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаются с проверкой доступа */}
            <img src={`/files/${fid}`} alt="" className="h-28 w-auto rounded-[3px] border border-card-line bg-white object-contain" />
            {!locked && (
              <button
                type="button"
                aria-label="Убрать картинку"
                onClick={() => onChange({ images: q.images.filter((x) => x !== fid) })}
                className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-accent text-[12px] font-bold text-ink"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {!locked && (
          <label className="flex h-28 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed border-card-line text-center text-[13px] text-text/60 transition hover:border-blue hover:text-blue">
            {uploading ? "Загружаем…" : "+ картинка"}
            <span className="text-[11px]">JPG, PNG, WebP</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                void addImages(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {q.kind === "choice" && (
        <fieldset className="flex flex-col gap-2" disabled={locked}>
          <legend className="pb-2 text-sm text-text">Варианты ответа — отметьте правильные</legend>
          {q.options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={o.correct}
                onChange={(e) => setOption(o.id, { correct: e.target.checked })}
                aria-label={`Вариант ${i + 1} правильный`}
                className="size-5 shrink-0 accent-green"
              />
              <input
                value={o.text}
                onChange={(e) => setOption(o.id, { text: e.target.value })}
                placeholder={`Вариант ${i + 1}`}
                className={`min-w-0 flex-1 rounded-[3px] border bg-bg px-3 py-2 text-[15px] text-text outline-none focus:border-blue ${
                  o.correct ? "border-green" : "border-card-line"
                }`}
              />
              {!locked && q.options.length > 2 && (
                <IconBtn label="Убрать вариант" onClick={() => onChange({ options: q.options.filter((x) => x.id !== o.id) })}>
                  ✕
                </IconBtn>
              )}
            </div>
          ))}
          {!locked && (
            <button
              type="button"
              onClick={() => onChange({ options: [...q.options, newOption()] })}
              className="cursor-pointer self-start text-[14px] text-blue underline-offset-4 hover:underline"
            >
              + вариант
            </button>
          )}
        </fieldset>
      )}

      {q.kind === "short" && (
        <fieldset className="flex flex-col gap-2" disabled={locked}>
          <legend className="pb-2 text-sm text-text">Правильный ответ (можно несколько равноценных)</legend>
          {q.accepted.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                value={a}
                onChange={(e) => onChange({ accepted: q.accepted.map((x, j) => (j === i ? e.target.value : x)) })}
                placeholder={i === 0 ? "например, 0,5" : "ещё вариант записи"}
                className="min-w-0 max-w-[320px] flex-1 rounded-[3px] border border-green bg-bg px-3 py-2 text-[15px] text-text outline-none focus:border-blue"
              />
              {!locked && q.accepted.length > 1 && (
                <IconBtn label="Убрать" onClick={() => onChange({ accepted: q.accepted.filter((_, j) => j !== i) })}>
                  ✕
                </IconBtn>
              )}
            </div>
          ))}
          {!locked && (
            <button
              type="button"
              onClick={() => onChange({ accepted: [...q.accepted, ""] })}
              className="cursor-pointer self-start text-[14px] text-blue underline-offset-4 hover:underline"
            >
              + вариант записи
            </button>
          )}
        </fieldset>
      )}
    </li>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-text">{label}</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="resize-y rounded-[3px] border border-card-line bg-bg px-4 py-3 text-[15px] leading-[22px] text-text outline-none transition focus:border-blue disabled:opacity-60"
      />
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 cursor-pointer items-center justify-center rounded-[3px] border border-card-line text-[14px] text-text transition hover:border-blue disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}
