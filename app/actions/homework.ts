"use server";

import { revalidatePath } from "next/cache";
import { HomeworkError, submitHomework, type StudentAnswer } from "@/lib/homework";
import { getSession } from "@/lib/session";

/** Ученик сдаёт ДЗ (одна попытка). */
export async function submitHomeworkAction(assignmentId: string, answers: StudentAnswer[]) {
  const s = await getSession();
  if (!s) return { error: "Войдите в аккаунт." };
  try {
    await submitHomework(assignmentId, s.user.id, answers);
  } catch (e) {
    if (e instanceof HomeworkError) return { error: e.message };
    // повторная отправка той же работы (двойной клик) — уникальный индекс
    if (String(e).includes("submission_once_idx")) return { error: "Работа уже сдана — попытка одна." };
    throw e;
  }
  revalidatePath(`/cabinet/hw/${assignmentId}`);
  return { ok: true };
}
