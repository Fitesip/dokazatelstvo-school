"use server";

import { randomUUID } from "node:crypto";
import { db, schema } from "@/lib/db";
import { LEAD_KINDS, type LeadKind } from "@/lib/leads";

interface LeadInput {
  phone: string;
  name?: string;
  note?: string;
  website: string;
}

/** Заявка с формы сайта. Возвращает false, если телефон не похож на номер. */
export async function createLead(kind: LeadKind, input: LeadInput) {
  // скрытое поле-ловушка: люди его не видят, боты заполняют
  if (input.website) return true;
  if (!(kind in LEAD_KINDS)) return false;
  const phone = input.phone.trim().slice(0, 32);
  if (phone.replace(/\D/g, "").length < 10) return false;
  await db.insert(schema.lead).values({
    id: randomUUID(),
    kind,
    phone,
    name: input.name?.trim().slice(0, 100) || null,
    note: input.note?.trim().slice(0, 2000) || null,
  });
  return true;
}
