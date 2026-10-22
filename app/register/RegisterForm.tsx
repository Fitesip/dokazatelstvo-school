"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAfterPurchase, type FormState } from "@/app/actions/account";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError } from "@/components/ui/Field";

export function RegisterForm({ claim, email }: { claim: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAfterPurchase, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="claim" value={claim} />
      <Field label="Имя" name="name" autoComplete="name" required placeholder="Как к вам обращаться" />
      <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={email} />
      <Field
        label="Пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Минимум 8 символов"
      />
      <Field label="Пароль ещё раз" name="password2" type="password" autoComplete="new-password" required />
      <FormError>{state.error}</FormError>
      <PrimarySubmit type="submit" disabled={pending}>
        {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </PrimarySubmit>
      <p className="text-[13px] text-text/60">
        Уже есть аккаунт?{" "}
        <Link href={`/login?claim=${encodeURIComponent(claim)}`} className="text-blue underline">
          Войти
        </Link>{" "}
        — покупка добавится к нему.
      </p>
    </form>
  );
}
