"use server";

import { notFound, redirect } from "next/navigation";
import { isDemoShop } from "@/lib/demo";
import { sendMail } from "@/lib/mail";
import { createOrder, getOrder, markFailed, markPaid } from "@/lib/orders";
import { getSession } from "@/lib/session";

const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** «Купить»: создаёт заказ и ведёт на оплату. */
export async function buyAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const session = await getSession();
  const id = await createOrder([productId], session?.user.id ?? null);
  redirect(`/checkout/${id}`);
}

/**
 * Страница-заглушка оплаты: «платёж прошёл» / «не прошёл».
 * Будет заменена настоящей платёжной системой на этапе 3.
 */
export async function payStubAction(formData: FormData) {
  if (!isDemoShop()) notFound();

  const orderId = String(formData.get("orderId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const o = await getOrder(orderId);
  if (!o) notFound();
  const session = await getSession();
  if (o.userId && o.userId !== session?.user.id) notFound();
  if (o.status === "paid") redirect(o.userId ? "/cabinet" : `/checkout/${orderId}`);

  if (outcome === "fail") {
    await markFailed(orderId);
    redirect(`/checkout/${orderId}?failed=1`);
  }

  // гостю нужен e-mail: на него придёт чек и ссылка на регистрацию
  if (!o.userId && !EMAIL_RE.test(email)) {
    redirect(`/checkout/${orderId}?error=email`);
  }

  const { claimToken } = await markPaid(orderId, o.userId ? null : email);
  if (!claimToken) redirect(`/cabinet?paid=${orderId}`);

  const link = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/order/${orderId}/done?t=${claimToken}`;
  await sendMail({
    to: email,
    subject: "Оплата прошла — Доказательство",
    text: `Спасибо за покупку!\n\n${o.items.map((i) => `• ${i.title} — ${rub(i.price)}`).join("\n")}\nИтого: ${rub(o.amount)}\n\nЧтобы получить доступ, зарегистрируйтесь или войдите по ссылке:\n${link}`,
  });
  redirect(`/order/${orderId}/done?t=${claimToken}`);
}
