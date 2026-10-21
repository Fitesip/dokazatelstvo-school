import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "./db";

const { order, orderItem, product, bundleItem, enrollment } = schema;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Создаёт заказ со статусом «ожидает оплаты». Цена фиксируется на момент заказа. */
export async function createOrder(productIds: string[], userId: string | null) {
  const items = await db
    .select()
    .from(product)
    .where(and(inArray(product.id, productIds), eq(product.active, true)));
  if (items.length === 0 || items.length !== new Set(productIds).size) {
    throw new Error("Товар не найден или снят с продажи");
  }

  const id = randomUUID();
  const amount = items.reduce((sum, p) => sum + p.price, 0);
  await db.transaction(async (tx) => {
    await tx.insert(order).values({ id, amount, userId });
    await tx.insert(orderItem).values(
      items.map((p) => ({ orderId: id, productId: p.id, title: p.title, price: p.price })),
    );
  });
  return id;
}

export async function getOrder(id: string) {
  const [o] = await db.select().from(order).where(eq(order.id, id));
  if (!o) return null;
  const items = await db.select().from(orderItem).where(eq(orderItem.orderId, id));
  return { ...o, items };
}

/**
 * Оплата прошла. Если покупатель уже вошёл — сразу открываем доступ.
 * Иначе выдаём одноразовый код: с ним можно зарегистрироваться или войти,
 * и покупка привяжется к аккаунту.
 */
export async function markPaid(orderId: string, email: string | null) {
  const o = await getOrder(orderId);
  if (!o) throw new Error("Заказ не найден");
  if (o.status === "paid") return { claimToken: null as string | null };

  const claimToken = o.userId ? null : randomBytes(24).toString("base64url");
  await db
    .update(order)
    .set({
      status: "paid",
      paidAt: new Date(),
      email: email ?? o.email,
      claimTokenHash: claimToken ? hash(claimToken) : null,
    })
    .where(eq(order.id, orderId));

  if (o.userId) await grantAccess(orderId, o.userId);
  return { claimToken };
}

export async function markFailed(orderId: string) {
  await db
    .update(order)
    .set({ status: "failed" })
    .where(and(eq(order.id, orderId), inArray(order.status, ["pending", "failed"])));
}

/** Оплаченный, ещё не привязанный заказ по одноразовому коду. */
export async function findClaim(token: string | null | undefined) {
  if (!token) return null;
  const [o] = await db
    .select()
    .from(order)
    .where(and(eq(order.claimTokenHash, hash(token)), eq(order.status, "paid"), isNull(order.claimedAt)));
  return o ?? null;
}

/** Привязывает оплаченный заказ к аккаунту и открывает доступ. */
export async function claimOrder(token: string, userId: string) {
  const o = await findClaim(token);
  if (!o) return false;
  await grantAccess(o.id, userId);
  return true;
}

/** Открывает доступ к номерам из заказа (наборы раскрываются в отдельные номера). */
async function grantAccess(orderId: string, userId: string) {
  await db.transaction(async (tx) => {
    const items = await tx.select().from(orderItem).where(eq(orderItem.orderId, orderId));
    const ids = items.map((i) => i.productId);
    const kinds = await tx
      .select({ id: product.id, kind: product.kind })
      .from(product)
      .where(inArray(product.id, ids));
    const bundleIds = kinds.filter((k) => k.kind === "bundle").map((k) => k.id);
    const inBundles = bundleIds.length
      ? await tx.select().from(bundleItem).where(inArray(bundleItem.bundleId, bundleIds))
      : [];
    const taskIds = new Set([
      ...kinds.filter((k) => k.kind === "task").map((k) => k.id),
      ...inBundles.map((b) => b.productId),
    ]);

    if (taskIds.size) {
      await tx
        .insert(enrollment)
        .values([...taskIds].map((productId) => ({ userId, productId, orderId })))
        .onConflictDoNothing();
    }
    await tx
      .update(order)
      .set({ userId, claimedAt: new Date(), claimTokenHash: null })
      .where(eq(order.id, orderId));
  });
}

/** Номера, к которым у ученика есть доступ. */
export async function getEnrollments(userId: string) {
  return db
    .select({ id: product.id, title: product.title, exam: product.exam, since: enrollment.createdAt })
    .from(enrollment)
    .innerJoin(product, eq(product.id, enrollment.productId))
    .where(eq(enrollment.userId, userId))
    .orderBy(product.sort);
}
