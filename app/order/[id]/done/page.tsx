import Link from "next/link";
import { claimAfterLoginAction } from "@/app/actions/account";
import { OutlineButton, PrimaryButton, PrimarySubmit } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { FormNote } from "@/components/ui/Field";
import { findClaim } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Оплата прошла — Доказательство", robots: { index: false } };

/** После оплаты без входа: «Зарегистрироваться / Войти» — покупка привяжется к аккаунту. */
export default async function OrderDonePage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const claim = await findClaim(t);
  const session = await getSession();

  if (!claim || !t) {
    return (
      <AuthCard
        title="Ссылка уже использована"
        subtitle="Покупка по этой ссылке уже привязана к аккаунту или ссылка неверная."
      >
        <PrimaryButton href={session ? "/cabinet" : "/login"}>
          {session ? "В личный кабинет" : "Войти"}
        </PrimaryButton>
      </AuthCard>
    );
  }

  const q = `claim=${encodeURIComponent(t)}`;

  if (session) {
    // уже вошли — предлагаем привязать покупку к текущему аккаунту одной кнопкой
    return (
      <AuthCard title="Оплата прошла" subtitle={`Вы вошли как ${session.user.email}.`}>
        <form action={claimAfterLoginAction} className="flex flex-col gap-3">
          <input type="hidden" name="claim" value={t} />
          <PrimarySubmit type="submit">Добавить покупку в этот аккаунт</PrimarySubmit>
        </form>
        <p className="text-[13px] text-text/60">
          Хотите другой аккаунт?{" "}
          <Link href={`/login?${q}`} className="text-blue underline">
            Войти под другим
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Оплата прошла"
      subtitle="Осталось получить доступ: создайте аккаунт или войдите в существующий — покупка добавится к нему."
    >
      {claim.email && (
        <FormNote>
          Ссылка на эту страницу также отправлена на {claim.email} — на случай, если закроете вкладку.
        </FormNote>
      )}
      <div className="flex flex-col gap-3">
        <PrimaryButton href={`/register?${q}`}>Зарегистрироваться</PrimaryButton>
        <OutlineButton href={`/login?${q}`}>У меня уже есть аккаунт — войти</OutlineButton>
      </div>
    </AuthCard>
  );
}

