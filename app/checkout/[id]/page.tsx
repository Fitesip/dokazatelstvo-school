import { notFound, redirect } from "next/navigation";
import { payStubAction } from "@/app/actions/shop";
import { PrimarySubmit } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { Field, FormError } from "@/components/ui/Field";
import { isDemoShop } from "@/lib/demo";
import { getOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Оплата — Доказательство", robots: { index: false } };

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ failed?: string; error?: string }>;
}) {
  if (!isDemoShop()) notFound();
  const { id } = await params;
  const { failed, error } = await searchParams;

  const o = await getOrder(id);
  if (!o) notFound();
  const session = await getSession();
  if (o.userId && o.userId !== session?.user.id) notFound();
  if (o.status === "paid") redirect(o.userId ? "/cabinet" : "/");

  const guest = !o.userId;

  return (
    <AuthCard
      title="Оплата заказа"
      subtitle={
        <>
          Это <b>страница-заглушка</b>: настоящая оплата появится позже. Нажмите, чем
          закончился платёж.
        </>
      }
    >
      <ul className="flex flex-col gap-2 border-y border-card-line py-4 text-[15px]">
        {o.items.map((i) => (
          <li key={i.productId} className="flex justify-between gap-4">
            <span>{i.title}</span>
            <span className="whitespace-nowrap">{i.price.toLocaleString("ru-RU")} ₽</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 pt-2 font-bold text-blue">
          <span>Итого</span>
          <span>{o.amount.toLocaleString("ru-RU")} ₽</span>
        </li>
      </ul>

      {failed && <FormError>Платёж не прошёл. Можно попробовать ещё раз.</FormError>}
      {error === "email" && <FormError>Укажите e-mail — на него придут чек и ссылка для входа.</FormError>}

      <form action={payStubAction} className="flex flex-col gap-4">
        <input type="hidden" name="orderId" value={o.id} />
        {guest && (
          <Field
            label="E-mail для чека и доступа"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            defaultValue={o.email ?? ""}
            aria-invalid={error === "email"}
          />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimarySubmit type="submit" name="outcome" value="success" className="flex-1">
            Платёж прошёл
          </PrimarySubmit>
          <button
            type="submit"
            name="outcome"
            value="fail"
            formNoValidate
            className="glow-blue inline-flex flex-1 cursor-pointer items-center justify-center rounded-[3px] border border-card-line px-[22px] py-3 text-[15px] font-bold text-blue transition hover:border-blue"
          >
            Не прошёл
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
