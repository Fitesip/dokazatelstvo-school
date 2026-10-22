"use client";

import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";
import { finishLogin } from "../finish";
import { authErrorText } from "../LoginForm";

export function TwoFactorForm() {
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const code = String(form.get("code")).replace(/\s/g, "");
    const trustDevice = form.get("trust") === "on";
    setPending(true);
    setError(undefined);

    const res = backup
      ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice });

    if (res.error) {
      setError(
        res.error.status === 401 || res.error.status === 400
          ? "Код не подошёл. Проверьте и попробуйте ещё раз."
          : authErrorText(res.error.status, res.error.message),
      );
      setPending(false);
      return;
    }
    await finishLogin(new URLSearchParams(window.location.search));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field
        key={backup ? "backup" : "totp"}
        label={backup ? "Резервный код" : "Код из приложения"}
        name="code"
        required
        autoFocus
        autoComplete="one-time-code"
        inputMode={backup ? "text" : "numeric"}
        placeholder={backup ? "xxxxx-xxxxx" : "123456"}
      />
      <label className="flex items-center gap-2 text-[14px] text-text">
        <input type="checkbox" name="trust" className="size-4 accent-accent" />
        Доверять этому устройству 30 дней
      </label>
      <FormError>{error}</FormError>
      <PrimarySubmit type="submit" disabled={pending}>
        {pending ? "Проверяем…" : "Подтвердить"}
      </PrimarySubmit>
      <button
        type="button"
        onClick={() => {
          setBackup((b) => !b);
          setError(undefined);
        }}
        className="cursor-pointer self-start text-[13px] text-blue underline"
      >
        {backup ? "Ввести код из приложения" : "Нет доступа к приложению? Резервный код"}
      </button>
    </form>
  );
}
