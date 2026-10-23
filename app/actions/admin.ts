"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
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
