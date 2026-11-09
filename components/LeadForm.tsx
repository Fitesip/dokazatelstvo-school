"use client";

import { useId, useState, type FormEvent } from "react";
import { createLead } from "@/app/actions/lead";
import type { LeadKind } from "@/lib/leads";
import { ymGoal } from "@/lib/metrika";
import { PrimarySubmit } from "./Button";

type Status = "idle" | "error" | "sending" | "failed" | "sent";

const INPUT =
  "min-w-0 rounded-[3px] border border-card-line bg-ink px-4 py-3 text-[15px] text-text outline-none transition placeholder:text-text/40 focus:border-blue";

interface Props {
  kind: LeadKind;
  /** подпись над полем телефона */
  label: string;
  submit: string;
  success: string;
  /** контакты: дополнительно имя и текст обращения */
  extended?: boolean;
}

/** Форма заявки: телефон (и при необходимости имя с сообщением) → база → админка. */
export function LeadForm({ kind, label, submit, success, extended = false }: Props) {
  const phoneId = useId();
  const errorId = useId();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setStatus("error");
      return;
    }
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const ok = await createLead(kind, {
        phone,
        name: String(form.get("name") ?? ""),
        note: String(form.get("note") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (ok) ymGoal(`lead_${kind}`);
      setStatus(ok ? "sent" : "error");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <p className="glow-blue text-center text-[17px] font-bold text-blue" role="status">
        {success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[520px] flex-col gap-3">
      {extended && (
        <label className="flex flex-col gap-1.5 text-sm text-text">
          Как к вам обращаться
          <input name="name" autoComplete="name" maxLength={100} className={INPUT} />
        </label>
      )}
      <label htmlFor={phoneId} className="text-sm text-text">
        {label}
      </label>
      <div className={`flex flex-col gap-3 ${extended ? "" : "sm:flex-row"}`}>
        <input
          id={phoneId}
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
          aria-describedby={status === "error" ? errorId : undefined}
          className={`flex-1 ${INPUT} ${status === "error" ? "border-accent" : ""}`}
        />
        {!extended && (
          <PrimarySubmit type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Отправляем…" : submit}
          </PrimarySubmit>
        )}
      </div>
      {status === "error" && (
        <p id={errorId} className="text-[13px] text-accent">
          Введите номер телефона полностью
        </p>
      )}
      {extended && (
        <>
          <label className="flex flex-col gap-1.5 text-sm text-text">
            Сообщение
            <textarea name="note" rows={4} maxLength={2000} className={`resize-y ${INPUT}`} />
          </label>
          <PrimarySubmit type="submit" disabled={status === "sending"} className="self-start">
            {status === "sending" ? "Отправляем…" : submit}
          </PrimarySubmit>
        </>
      )}
      {/* ловушка для ботов: скрыта от людей и скринридеров */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {status === "failed" && (
        <p role="alert" className="text-[13px] text-accent">
          Не получилось отправить заявку. Попробуйте ещё раз.
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
