"use server";

import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";

/** Заявка на пробный урок с главной. Возвращает false, если телефон не похож на номер. */
export async function createTrialLead(phone: string, website: string) {
  // скрытое поле-ловушка: люди его не видят, боты заполняют
  if (website) return true;
  const clean = phone.trim().slice(0, 32);
  if (clean.replace(/\D/g, "").length < 10) return false;
  await db.insert(schema.lead).values({ id: randomUUID(), kind: "trial", phone: clean });
  return true;
}
