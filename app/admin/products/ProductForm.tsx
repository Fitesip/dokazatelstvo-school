"use client";

import { useActionState } from "react";
import { updateProductAction, type ProductState } from "@/app/actions/admin";
import { PrimarySubmit } from "@/components/Button";
import { Field, FormError } from "@/components/ui/Field";

interface Product {
  id: string;
  kind: "task" | "bundle";
  title: string;
  description: string;
  price: number;
  active: boolean;
  composition: string[];
}

export function ProductForm({ product: p }: { product: Product }) {
  const [state, action, pending] = useActionState<ProductState, FormData>(updateProductAction, {});

  return (
    <form
      action={action}
      className={`grid gap-4 rounded-[3px] border border-card-line bg-ink/60 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_120px] sm:items-end ${
        p.active ? "" : "opacity-60"
      }`}
    >
      <input type="hidden" name="id" value={p.id} />
      <div className="flex flex-col gap-1 sm:col-span-3">
        <span className="text-[12px] font-bold uppercase tracking-wide text-accent">
          {p.kind === "bundle" ? "набор" : "номер"} · {p.id}
        </span>
        {p.composition.length > 0 && <span className="text-[13px] text-text/60">Состав: {p.composition.join(", ")}</span>}
      </div>
      <Field label="Название" name="title" defaultValue={p.title} required />
      <Field label="Описание" name="description" defaultValue={p.description} />
      <Field label="Цена, ₽" name="price" defaultValue={String(p.price)} inputMode="numeric" required />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
        <label className="flex items-center gap-2 text-[14px] text-text">
          <input type="checkbox" name="active" defaultChecked={p.active} className="size-4 accent-accent" />
          В продаже
        </label>
        <PrimarySubmit type="submit" size="sm" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить"}
        </PrimarySubmit>
        {state.ok && !pending && <span className="text-[13px] text-green">Сохранено</span>}
      </div>
      {state.error && (
        <div className="sm:col-span-3">
          <FormError>{state.error}</FormError>
        </div>
      )}
    </form>
  );
}
