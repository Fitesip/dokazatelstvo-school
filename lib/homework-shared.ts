/** Общее для сервера и браузера: типы конструктора ДЗ, проверка перед публикацией, сравнение ответов. */
import type { QuestionKind } from "./db/schema";

/* ================= Типы для конструктора ================= */

export interface EditorOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface EditorQuestion {
  id: string;
  kind: QuestionKind;
  text: string;
  /** short: допустимые ответы */
  accepted: string[];
  /** choice: варианты */
  options: EditorOption[];
  /** id загруженных картинок */
  images: string[];
}

export interface EditorAssignment {
  title: string;
  description: string;
  /** YYYY-MM-DD или пусто */
  dueDate: string;
  questions: EditorQuestion[];
}

/* ================= Проверка ответов ================= */

/** «0,5» = «0.5» = « 0.50 », регистр и пробелы не важны. */
export function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, ".").replace(/[−–—]/g, "-");
}

export function shortIsCorrect(given: string, accepted: string[]) {
  const g = normalizeAnswer(given);
  if (!g) return false;
  return accepted.some((a) => {
    const n = normalizeAnswer(a);
    const [x, y] = [Number(g), Number(n)];
    if (g !== "" && n !== "" && Number.isFinite(x) && Number.isFinite(y)) return Math.abs(x - y) < 1e-9;
    return g === n;
  });
}

/** Ошибки, из-за которых ДЗ нельзя опубликовать (сохранить черновик можно и с ними). */
export function validateForPublish(a: EditorAssignment) {
  const errors: string[] = [];
  if (!a.title.trim()) errors.push("Укажите название ДЗ.");
  if (a.questions.length === 0) errors.push("Добавьте хотя бы один вопрос.");
  a.questions.forEach((q, i) => {
    const n = `Вопрос ${i + 1}`;
    if (!q.text.trim() && q.images.length === 0) errors.push(`${n}: нет ни текста, ни картинки.`);
    if (q.kind === "choice") {
      const filled = q.options.filter((o) => o.text.trim());
      if (filled.length < 2) errors.push(`${n}: нужно минимум два варианта ответа.`);
      if (!filled.some((o) => o.correct)) errors.push(`${n}: отметьте правильный вариант.`);
    }
    if (q.kind === "short" && !q.accepted.some((x) => x.trim())) errors.push(`${n}: укажите правильный ответ.`);
  });
  return errors;
}
