"use client";

import { useState } from "react";
import { submitHomeworkAction } from "@/app/actions/homework";
import { PrimarySubmit } from "@/components/Button";
import { FormError } from "@/components/ui/Field";
import type { QuestionKind } from "@/lib/db/schema";
import { uploadFile, type Uploaded } from "@/lib/upload-client";

export interface StudentQuestion {
  id: string;
  kind: QuestionKind;
  text: string;
  images: string[];
  options: { id: string; text: string }[];
  /** несколько правильных — показываем флажки вместо кружков */
  multiple: boolean;
}

interface Draft {
  optionIds: string[];
  text: string;
  files: Uploaded[];
}

const MAX_FILES = 10;

export function QuestionBody({ q, n }: { q: StudentQuestion; n: number }) {
  return (
    <>
      <h3 className="glow-blue text-[18px] font-bold text-blue">Вопрос {n}</h3>
      {q.text && <p className="whitespace-pre-line text-[16px] leading-[25px] text-text">{q.text}</p>}
      {q.images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {q.images.map((fid) => (
            <a key={fid} href={`/files/${fid}`} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- файлы отдаются с проверкой доступа */}
              <img src={`/files/${fid}`} alt={`Иллюстрация к вопросу ${n}`} className="max-h-72 w-auto max-w-full rounded-[3px] bg-white object-contain" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function HomeworkForm({ assignmentId, questions }: { assignmentId: string; questions: StudentQuestion[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, { optionIds: [], text: "", files: [] }])),
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const set = (qid: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [qid]: { ...d[qid], ...patch } }));

  const empty = questions.filter((q) => {
    const d = drafts[q.id];
    return q.kind === "choice" ? d.optionIds.length === 0 : q.kind === "short" ? !d.text.trim() : d.files.length === 0 && !d.text.trim();
  });

  async function addFiles(q: StudentQuestion, list: FileList | null) {
    if (!list?.length) return;
    const room = MAX_FILES - drafts[q.id].files.length;
    const picked = Array.from(list).slice(0, room);
    if (list.length > room) setError(`К одному вопросу — не больше ${MAX_FILES} файлов.`);
    setUploading(q.id);
    const added: Uploaded[] = [];
    for (const f of picked) {
      const res = await uploadFile(f, "submission");
      if ("error" in res) setError(`${f.name}: ${res.error}`);
      else added.push(res);
    }
    setDrafts((d) => ({ ...d, [q.id]: { ...d[q.id], files: [...d[q.id].files, ...added] } }));
    setUploading(null);
  }

  async function submit() {
    if (empty.length && !confirm(`Без ответа: вопросы ${empty.map((q) => questions.indexOf(q) + 1).join(", ")}. Всё равно отправить? Попытка одна.`)) return;
    if (!empty.length && !confirm("Отправить работу? Изменить ответы после отправки будет нельзя.")) return;
    setPending(true);
    setError(undefined);
    const res = await submitHomeworkAction(
      assignmentId,
      questions.map((q) => ({
        questionId: q.id,
        optionIds: drafts[q.id].optionIds,
        text: drafts[q.id].text,
        fileIds: drafts[q.id].files.map((f) => f.id),
      })),
    );
    if (res.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex flex-col gap-5">
        {questions.map((q, i) => {
          const d = drafts[q.id];
          return (
            <li key={q.id} className="flex flex-col gap-4 rounded-[3px] border border-card-line bg-ink/60 p-4 sm:p-5">
              <QuestionBody q={q} n={i + 1} />

              {q.kind === "choice" && (
                <fieldset className="flex flex-col gap-2">
                  <legend className="pb-2 text-[13px] text-text/60">
                    {q.multiple ? "Отметьте все верные варианты" : "Выберите один вариант"}
                  </legend>
                  {q.options.map((o) => {
                    const checked = d.optionIds.includes(o.id);
                    return (
                      <label
                        key={o.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-[3px] border px-3 py-2.5 text-[15px] transition ${
                          checked ? "border-blue bg-blue/10" : "border-card-line hover:border-blue/60"
                        }`}
                      >
                        <input
                          type={q.multiple ? "checkbox" : "radio"}
                          name={`q-${q.id}`}
                          checked={checked}
                          onChange={() =>
                            set(q.id, {
                              optionIds: q.multiple
                                ? checked
                                  ? d.optionIds.filter((x) => x !== o.id)
                                  : [...d.optionIds, o.id]
                                : [o.id],
                            })
                          }
                          className="size-4 shrink-0 accent-blue"
                        />
                        {o.text}
                      </label>
                    );
                  })}
                </fieldset>
              )}

              {q.kind === "short" && (
                <label className="flex max-w-[320px] flex-col gap-1.5">
                  <span className="text-[13px] text-text/60">Ответ</span>
                  <input
                    value={d.text}
                    onChange={(e) => set(q.id, { text: e.target.value })}
                    className="rounded-[3px] border border-card-line bg-bg px-4 py-3 text-[16px] text-text outline-none focus:border-blue"
                  />
                </label>
              )}

              {q.kind === "long" && (
                <div className="flex flex-col gap-3">
                  <span className="text-[13px] text-text/60">
                    Загрузите фото или PDF решения (до {MAX_FILES} файлов по 15 МБ: JPG, PNG, HEIC, PDF)
                  </span>
                  {d.files.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {d.files.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 text-[14px] text-text">
                          <span className="truncate">{f.name}</span>
                          <span className="shrink-0 text-text/50">{(f.size / 1024 / 1024).toFixed(1)} МБ</span>
                          <button
                            type="button"
                            onClick={() => set(q.id, { files: d.files.filter((x) => x.id !== f.id) })}
                            className="shrink-0 cursor-pointer text-accent underline-offset-4 hover:underline"
                          >
                            убрать
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {d.files.length < MAX_FILES && (
                    <label className="flex cursor-pointer items-center justify-center rounded-[3px] border border-dashed border-card-line px-4 py-5 text-[14px] text-blue transition hover:border-blue">
                      {uploading === q.id ? "Загружаем…" : "+ Прикрепить файлы"}
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif,application/pdf"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          void addFiles(q, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-text/60">Комментарий к решению (необязательно)</span>
                    <textarea
                      value={d.text}
                      onChange={(e) => set(q.id, { text: e.target.value })}
                      rows={2}
                      className="resize-y rounded-[3px] border border-card-line bg-bg px-4 py-3 text-[15px] text-text outline-none focus:border-blue"
                    />
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <FormError>{error}</FormError>
      <PrimarySubmit type="button" onClick={submit} disabled={pending || uploading !== null} className="self-start">
        {pending ? "Отправляем…" : "Сдать работу"}
      </PrimarySubmit>
    </div>
  );
}
