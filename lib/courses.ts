import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "./db";

const { product, enrollment, user } = schema;

/** Есть ли у ученика доступ к номеру (курсу). */
export async function isEnrolled(userId: string, productId: string) {
  const [row] = await db
    .select({ productId: enrollment.productId })
    .from(enrollment)
    .where(and(eq(enrollment.userId, userId), eq(enrollment.productId, productId)))
    .limit(1);
  return !!row;
}

/** Курс = отдельный номер (наборы раскрываются в номера при покупке). */
export async function getCourse(productId: string) {
  const [p] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, productId), eq(product.kind, "task")));
  return p ?? null;
}

export async function listCourses() {
  return db.select().from(product).where(eq(product.kind, "task")).orderBy(asc(product.sort));
}

export async function courseStudents(productId: string) {
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(enrollment)
    .innerJoin(user, eq(user.id, enrollment.userId))
    .where(eq(enrollment.productId, productId))
    .orderBy(asc(user.name));
}
