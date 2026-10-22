"use client";

import { claimForCurrentUser } from "@/app/actions/account";

/** Только относительные пути внутри сайта — чтобы ?next= нельзя было увести наружу. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/cabinet";
}

/** После успешного входа: привязать покупку (если пришли после оплаты) и перейти дальше. */
export async function finishLogin(params: URLSearchParams) {
  const claim = params.get("claim");
  const claimed = claim ? await claimForCurrentUser(claim) : false;
  const next = safeNext(params.get("next"));
  // полная перезагрузка: серверные компоненты должны увидеть новую сессию
  window.location.href = claimed && next === "/cabinet" ? "/cabinet?paid=1" : next;
}
