"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { Field, FormError, FormNote } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const email = String(new FormData(e.currentTarget).get("email"));
    const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (res.error?.status === 429) {
      setError("Слишком много запросов. Подождите минуту.");
      return;
    }
    // не сообщаем, есть ли такой e-mail в базе
    setSent(true);
  }

  return (
    <AuthCard title="Восстановление пароля" subtitle="Пришлём ссылку для смены пароля на почту аккаунта.">
      {sent ? (
        <FormNote>Если аккаунт с таким e-mail есть, письмо уже в пути. Ссылка действует 1 час.</FormNote>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="E-mail" name="email" type="email" autoComplete="email" required />
          <FormError>{error}</FormError>
          <PrimarySubmit type="submit" disabled={pending}>
            {pending ? "Отправляем…" : "Отправить ссылку"}
          </PrimarySubmit>
        </form>
      )}
      <Link href="/login" className="text-[13px] text-blue underline">
        Вернуться ко входу
      </Link>
    </AuthCard>
  );
}
