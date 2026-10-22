"use client";

import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";

export function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword.length < 8) return setError("Пароль — минимум 8 символов.");
    if (newPassword !== form.get("password2")) return setError("Пароли не совпадают.");

    setPending(true);
    setError(undefined);
    const res = await authClient.resetPassword({ newPassword, token });
    if (res.error) {
      setError("Ссылка устарела — запросите новую на странице восстановления.");
      setPending(false);
      return;
    }
    window.location.href = "/login?reset=1";
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Новый пароль" name="password" type="password" autoComplete="new-password" required minLength={8} hint="Минимум 8 символов" />
      <Field label="Ещё раз" name="password2" type="password" autoComplete="new-password" required />
      <FormError>{error}</FormError>
      <PrimarySubmit type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить пароль"}
      </PrimarySubmit>
    </form>
  );
}
