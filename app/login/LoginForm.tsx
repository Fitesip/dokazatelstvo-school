"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError, FormNote } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";
import { finishLogin } from "./finish";

export function authErrorText(status?: number, message?: string) {
  if (status === 401) return "Неверный e-mail или пароль.";
  if (status === 429) return "Слишком много попыток. Подождите минуту и попробуйте снова.";
  return message || "Не удалось войти. Попробуйте ещё раз.";
}

export function LoginForm({ resetDone }: { resetDone: boolean }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(undefined);
    await authClient.signIn.email(
      { email: String(form.get("email")), password: String(form.get("password")) },
      {
        async onSuccess(ctx) {
          // при включённой 2FA плагин сам уведёт на /login/2fa
          if (ctx.data?.twoFactorRedirect) return;
          await finishLogin(new URLSearchParams(window.location.search));
        },
        onError(ctx) {
          setError(authErrorText(ctx.error.status, ctx.error.message));
          setPending(false);
        },
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {resetDone && <FormNote>Пароль изменён — войдите с новым паролем.</FormNote>}
      <Field label="E-mail" name="email" type="email" autoComplete="email" required />
      <Field label="Пароль" name="password" type="password" autoComplete="current-password" required />
      <FormError>{error}</FormError>
      <PrimarySubmit type="submit" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </PrimarySubmit>
      <div className="flex flex-col gap-1 text-[13px] text-text/60">
        <Link href="/forgot-password" className="text-blue underline">
          Забыли пароль?
        </Link>
        <span>Аккаунт создаётся после первой покупки.</span>
      </div>
    </form>
  );
}
