"use client";

import { useState, type FormEvent } from "react";
import { PrimarySubmit } from "./Button";

type Status = "idle" | "error" | "sent";

export function TrialForm() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setStatus("error");
      return;
    }
    // TODO: отправка заявки (API / Telegram-бот / CRM). Пока бэкенда нет —
    // заявка никуда не уходит, только показываем подтверждение.
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="glow-blue text-center text-[17px] font-bold text-blue" role="status">
        Спасибо! Перезвоним, чтобы договориться о пробном уроке.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-[520px] flex-col gap-3"
    >
      <label htmlFor="trial-phone" className="text-sm text-text">
        Оставьте телефон — перезвоним и подберём время
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="trial-phone"
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "trial-phone-error" : undefined}
          className={`min-w-0 flex-1 rounded-[3px] border bg-ink px-4 py-3 text-[15px] text-text outline-none transition placeholder:text-text/40 focus:border-blue ${
            status === "error" ? "border-accent" : "border-card-line"
          }`}
        />
        <PrimarySubmit type="submit">Записаться</PrimarySubmit>
      </div>
      {status === "error" && (
        <p id="trial-phone-error" className="text-[13px] text-accent">
          Введите номер телефона полностью
        </p>
      )}
      <p className="text-[12px] leading-[18px] text-text/60">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a href="#" className="underline transition hover:text-blue">
          политикой конфиденциальности
        </a>
        .
      </p>
    </form>
  );
}
