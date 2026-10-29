"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import {
  HomeworkError,
  createAssignment,
  deleteAssignment,
  gradeSubmission,
  saveAssignment,
  setPublished,
  type EditorAssignment,
} from "@/lib/homework";
import { endLesson, normalizeCallUrl, startLesson } from "@/lib/lessons";
import { getSession } from "@/lib/session";

async function assertTeacher() {
  const s = await getSession();
  if (s?.user.role !== "teacher") throw new Error("Нет доступа");
}

/** Заявка обработана / вернуть в новые. */
export async function toggleLeadAction(formData: FormData) {
  await assertTeacher();
  const id = String(formData.get("id"));
  const done = formData.get("done") === "1";
  await db
    .update(schema.lead)
    .set({ status: done ? "done" : "new" })
    .where(eq(schema.lead.id, id));
  revalidatePath("/admin");
}

export interface ProductState {
  error?: string;
  ok?: boolean;
}

/** Название, описание, цена, «в продаже» — пока клиентка не прислала настоящие. */
export async function updateProductAction(_: ProductState, formData: FormData): Promise<ProductState> {
  await assertTeacher();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(String(formData.get("price") ?? "").replace(/\s/g, ""));
  const active = formData.get("active") === "on";

  if (title.length < 2) return { error: "Название слишком короткое." };
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) return { error: "Цена — целое число рублей." };

  await db.update(schema.product).set({ title, description, price, active }).where(eq(schema.product.id, id));
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ---------- Уроки ---------- */

export interface StartLessonState {
  error?: string;
  ok?: boolean;
}

/** «Начать урок»: преподаватель даёт ссылку на уже созданный звонок — ученики переходят прямо по ней. */
export async function startLessonAction(_: StartLessonState, formData: FormData): Promise<StartLessonState> {
  const s = await getSession();
  if (s?.user.role !== "teacher") throw new Error("Нет доступа");
  const callUrl = normalizeCallUrl(String(formData.get("callUrl") ?? ""));
  if (!callUrl) return { error: "Вставьте ссылку на звонок, например https://telemost.yandex.ru/j/…" };
  await startLesson(String(formData.get("productId")), s.user.id, callUrl);
  revalidatePath("/admin/courses", "layout");
  return { ok: true };
}

export async function endLessonAction(formData: FormData) {
  await assertTeacher();
  await endLesson(String(formData.get("productId")));
  revalidatePath("/admin/courses", "layout");
}

/* ---------- ДЗ ---------- */

export async function createAssignmentAction(formData: FormData) {
  await assertTeacher();
  const id = await createAssignment(String(formData.get("productId")));
  redirect(`/admin/homework/${id}`);
}

export interface SaveState {
  error?: string;
  savedAt?: number;
}

/** Сохранение конструктора: всё ДЗ одним JSON. */
export async function saveAssignmentAction(id: string, data: EditorAssignment): Promise<SaveState> {
  await assertTeacher();
  try {
    await saveAssignment(id, data);
  } catch (e) {
    if (e instanceof HomeworkError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/admin/homework/${id}`);
  return { savedAt: Date.now() };
}

export async function publishAssignmentAction(id: string, publish: boolean): Promise<SaveState> {
  await assertTeacher();
  try {
    const productId = await setPublished(id, publish);
    revalidatePath(`/admin/courses/${productId}`);
  } catch (e) {
    if (e instanceof HomeworkError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/admin/homework/${id}`);
  return { savedAt: Date.now() };
}

export async function deleteAssignmentAction(id: string): Promise<SaveState> {
  await assertTeacher();
  let productId: string | null;
  try {
    productId = await deleteAssignment(id);
  } catch (e) {
    if (e instanceof HomeworkError) return { error: e.message };
    throw e;
  }
  redirect(productId ? `/admin/courses/${productId}` : "/admin/courses");
}

/* ---------- Проверка ---------- */

export interface GradeState {
  error?: string;
}

export async function gradeAction(_: GradeState, formData: FormData): Promise<GradeState> {
  const s = await getSession();
  if (s?.user.role !== "teacher") throw new Error("Нет доступа");
  try {
    await gradeSubmission(
      String(formData.get("id")),
      Number(formData.get("grade")),
      String(formData.get("comment") ?? ""),
      s.user.id,
    );
  } catch (e) {
    if (e instanceof HomeworkError) return { error: e.message };
    throw e;
  }
  revalidatePath("/admin/review");
  redirect("/admin/review?graded=1");
}
