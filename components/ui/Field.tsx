import type { ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
  label: string;
  hint?: string;
}

/** Поле формы в стиле сайта: подпись сверху, тёмный инпут, подсказка снизу. */
export function Field({ label, hint, id, name, className = "", ...rest }: Props) {
  const fieldId = id ?? name;
  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5">
      <span className="text-sm text-text">{label}</span>
      <input
        id={fieldId}
        name={name}
        className={`rounded-[3px] border border-card-line bg-ink px-4 py-3 text-[15px] text-text outline-none transition placeholder:text-text/40 focus:border-blue aria-[invalid=true]:border-accent ${className}`}
        {...rest}
      />
      {hint && <span className="text-[12px] text-text/60">{hint}</span>}
    </label>
  );
}

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-[3px] border border-accent/60 bg-accent/10 px-4 py-3 text-[14px] text-text">
      {children}
    </p>
  );
}

export function FormNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="rounded-[3px] border border-blue/60 bg-blue/10 px-4 py-3 text-[14px] text-text">
      {children}
    </p>
  );
}
