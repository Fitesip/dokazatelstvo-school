"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { claimOrder, findClaim } from "@/lib/orders";
import { getSession } from "@/lib/session";

export interface FormState {
  error?: string;
}

/** Регистрация — только по одноразовому коду из оплаченного заказа. */
export async function registerAfterPurchase(_: FormState, formData: FormData): Promise<FormState> {
  const claim = String(formData.get("claim") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (!(await findClaim(claim))) {
    return { error: "Ссылка для регистрации устарела или уже использована." };
  }
  if (name.length < 2) return { error: "Укажите имя." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Проверьте e-mail." };
  if (password.length < 8) return { error: "Пароль — минимум 8 символов." };
  if (password !== password2) return { error: "Пароли не совпадают." };

  let userId: string;
  try {
    const res = await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: "/cabinet" },
      headers: await headers(),
    });
    userId = res.user.id;
  } catch (e) {
    if (e instanceof APIError && String(e.body?.code ?? "").startsWith("USER_ALREADY_EXISTS")) {
      return { error: "Аккаунт с этим e-mail уже есть — войдите, и покупка добавится к нему." };
    }
    if (e instanceof APIError) return { error: e.body?.message ?? "Не удалось зарегистрироваться." };
    throw e;
  }

  await claimOrder(claim, userId);
  redirect("/cabinet?welcome=1");
}

/** Привязать оплаченный заказ к текущему аккаунту (после входа). */
export async function claimForCurrentUser(claim: string) {
  const session = await getSession();
  if (!session || !claim) return false;
  return claimOrder(claim, session.user.id);
}

/** Кнопка «Добавить покупку в этот аккаунт» на странице после оплаты. */
export async function claimAfterLoginAction(formData: FormData) {
  const claim = String(formData.get("claim") ?? "");
  const ok = await claimForCurrentUser(claim);
  redirect(ok ? "/cabinet?paid=1" : "/cabinet");
}
