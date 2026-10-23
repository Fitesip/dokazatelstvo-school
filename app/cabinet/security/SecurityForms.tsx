"use client";

import QRCode from "qrcode";
import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError, FormNote } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex max-w-[560px] flex-col gap-4 rounded-[3px] border border-card-line bg-ink/60 p-5 sm:p-6">
      <h2 className="text-[19px] font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

type Step =
  | { kind: "idle" }
  | { kind: "scan"; qr: string; secret: string; backupCodes: string[] }
  | { kind: "codes"; backupCodes: string[] };

/** Включение 2FA: пароль → QR-код для Google Authenticator / Яндекс Ключа → код → резервные коды. */
export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function start(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setPending(true);
    setError(undefined);
    const res = await authClient.twoFactor.enable({ password, method: "totp" });
    setPending(false);
    if (res.error || res.data?.method !== "totp") return setError("Неверный пароль.");
    const { totpURI, backupCodes } = res.data;
    const secret = new URL(totpURI).searchParams.get("secret") ?? "";
    const qr = await QRCode.toDataURL(totpURI, { margin: 1, width: 220 });
    setStep({ kind: "scan", qr, secret, backupCodes });
  }

  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step.kind !== "scan") return;
    const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
    setPending(true);
    setError(undefined);
    const res = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (res.error) return setError("Код не подошёл. Проверьте время на телефоне и попробуйте ещё раз.");
    setStep({ kind: "codes", backupCodes: step.backupCodes });
  }

  async function disable(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setPending(true);
    setError(undefined);
    const res = await authClient.twoFactor.disable({ password });
    setPending(false);
    if (res.error) return setError("Неверный пароль.");
    window.location.reload();
  }

  if (step.kind === "codes") {
    return (
      <Card title="Двухфакторная защита включена">
        <FormNote>
          Сохраните резервные коды — по одному из них можно войти, если телефон потерян. Каждый код
          одноразовый. Больше мы их не покажем.
        </FormNote>
        <ul className="grid grid-cols-2 gap-2 rounded-[3px] bg-bg p-4 font-mono text-[15px] text-text">
          {step.backupCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <PrimarySubmit type="button" onClick={() => window.location.reload()}>
          Я сохранил коды
        </PrimarySubmit>
      </Card>
    );
  }

  if (step.kind === "scan") {
    return (
      <Card title="Подключите приложение">
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[14px] text-text/80">
          <li>Откройте Google Authenticator или Яндекс Ключ.</li>
          <li>Отсканируйте QR-код (или введите ключ вручную).</li>
          <li>Введите 6-значный код из приложения.</li>
        </ol>
        {/* eslint-disable-next-line @next/next/no-img-element -- data:-URL с QR-кодом */}
        <img src={step.qr} alt="QR-код для приложения-аутентификатора" width={220} height={220} className="rounded-[3px] bg-white p-2" />
        <p className="break-all text-[13px] text-text/60">
          Ключ: <span className="font-mono text-text">{step.secret}</span>
        </p>
        <form onSubmit={confirm} className="flex flex-col gap-4">
          <Field label="Код из приложения" name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="123456" />
          <FormError>{error}</FormError>
          <PrimarySubmit type="submit" disabled={pending}>
            {pending ? "Проверяем…" : "Включить"}
          </PrimarySubmit>
        </form>
      </Card>
    );
  }

  return (
    <Card title="Двухфакторная защита">
      <p className="text-[14px] leading-[22px] text-text/80">
        {enabled
          ? "Включена: при входе нужен код из приложения Google Authenticator или Яндекс Ключ."
          : "При входе, кроме пароля, будет нужен код из приложения Google Authenticator или Яндекс Ключ. Так аккаунт не откроют, даже если узнают пароль."}
      </p>
      <form onSubmit={enabled ? disable : start} className="flex flex-col gap-4">
        <Field label="Текущий пароль" name="password" type="password" autoComplete="current-password" required />
        <FormError>{error}</FormError>
        <PrimarySubmit type="submit" disabled={pending}>
          {pending ? "Подождите…" : enabled ? "Отключить" : "Включить"}
        </PrimarySubmit>
      </form>
    </Card>
  );
}

export function ChangePassword() {
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = String(form.get("new"));
    if (newPassword.length < 8) return setError("Новый пароль — минимум 8 символов.");
    if (newPassword !== form.get("new2")) return setError("Пароли не совпадают.");
    setPending(true);
    setError(undefined);
    const res = await authClient.changePassword({
      currentPassword: String(form.get("current")),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (res.error) return setError("Текущий пароль неверный.");
    formEl.reset();
    setDone(true);
  }

  return (
    <Card title="Смена пароля">
      {done && <FormNote>Пароль изменён. Остальные устройства вышли из аккаунта.</FormNote>}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Текущий пароль" name="current" type="password" autoComplete="current-password" required />
        <Field label="Новый пароль" name="new" type="password" autoComplete="new-password" required minLength={8} />
        <Field label="Новый пароль ещё раз" name="new2" type="password" autoComplete="new-password" required />
        <FormError>{error}</FormError>
        <PrimarySubmit type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Сменить пароль"}
        </PrimarySubmit>
      </form>
    </Card>
  );
}
