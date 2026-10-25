import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "./db";

const { lesson, product, enrollment } = schema;

/** Начать урок по номеру. Если урок уже идёт — возвращаем его, второй не создаём. */
export async function startLesson(productId: string, teacherId: string) {
  const live = await liveLesson(productId);
  if (live) return live.id;
  const id = randomUUID();
  await db.insert(lesson).values({ id, productId, startedBy: teacherId });
  return id;
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
    .select({ id: lesson.id, productId: lesson.productId, title: product.title, startedAt: lesson.startedAt })
    .from(lesson)
    .innerJoin(product, eq(product.id, lesson.productId));
  if (isTeacher) return base.where(isNull(lesson.endedAt));
  return base
    .innerJoin(enrollment, and(eq(enrollment.productId, lesson.productId), eq(enrollment.userId, userId)))
    .where(isNull(lesson.endedAt));
}

export async function getLesson(id: string) {
  const [l] = await db
    .select({ lesson, title: product.title })
    .from(lesson)
    .innerJoin(product, eq(product.id, lesson.productId))
    .where(eq(lesson.id, id));
  return l ?? null;
}
