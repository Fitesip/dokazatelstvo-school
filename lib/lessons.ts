import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db, schema } from "./db";

const { lesson, product, enrollment } = schema;

/**
 * Ссылка на звонок от преподавателя. Только http(s) — чтобы в кнопку ученика
 * нельзя было подставить javascript: и т. п. Без схемы — дописываем https://.
 */
export function normalizeCallUrl(raw: string) {
  const v = raw.trim();
  if (!v) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Начать урок по номеру со ссылкой на звонок. Если урок уже идёт — обновляем ссылку. */
export async function startLesson(productId: string, teacherId: string, callUrl: string) {
  const live = await liveLesson(productId);
  if (live) {
    await db.update(lesson).set({ callUrl }).where(eq(lesson.id, live.id));
    return live.id;
  }
  const id = randomUUID();
  await db.insert(lesson).values({ id, productId, startedBy: teacherId, callUrl });
  return id;
}

/** Ссылка с прошлого урока курса — подставляем в форму, обычно комната одна и та же. */
export async function lastCallUrl(productId: string) {
  const [l] = await db
    .select({ callUrl: lesson.callUrl })
    .from(lesson)
    .where(and(eq(lesson.productId, productId), isNotNull(lesson.callUrl)))
    .orderBy(desc(lesson.startedAt))
    .limit(1);
  return l?.callUrl ?? "";
}

export async function endLesson(productId: string) {
  await db
    .update(lesson)
    .set({ endedAt: new Date() })
    .where(and(eq(lesson.productId, productId), isNull(lesson.endedAt)));
}

export async function liveLesson(productId: string) {
  const [l] = await db
    .select()
    .from(lesson)
    .where(and(eq(lesson.productId, productId), isNull(lesson.endedAt)))
    .limit(1);
  return l ?? null;
}

/** Идущие уроки, которые видит пользователь: ученик — по купленным номерам, преподаватель — все. */
export async function liveLessonsFor(userId: string, isTeacher: boolean) {
  const base = db
    .select({ id: lesson.id, productId: lesson.productId, title: product.title, callUrl: lesson.callUrl, startedAt: lesson.startedAt })
    .from(lesson)
    .innerJoin(product, eq(product.id, lesson.productId));
  if (isTeacher) return base.where(isNull(lesson.endedAt));
  return base
    .innerJoin(enrollment, and(eq(enrollment.productId, lesson.productId), eq(enrollment.userId, userId)))
    .where(isNull(lesson.endedAt));
}

