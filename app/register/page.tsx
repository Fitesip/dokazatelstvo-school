import { PrimaryButton } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { findClaim } from "@/lib/orders";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Регистрация — Доказательство", robots: { index: false } };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>;
}) {
  const { claim } = await searchParams;
  const order = await findClaim(claim);

  if (!order || !claim) {
    return (
      <AuthCard
        title="Регистрация после покупки"
        subtitle="Аккаунт создаётся после оплаты первого номера или набора — ссылка придёт на почту и откроется сразу после оплаты. Эта ссылка недействительна или уже использована."
      >
        <PrimaryButton href="/login">Войти в аккаунт</PrimaryButton>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Создание аккаунта" subtitle="Покупка добавится в личный кабинет сразу после регистрации.">
      <RegisterForm claim={claim} email={order.email ?? ""} />
    </AuthCard>
  );
}
