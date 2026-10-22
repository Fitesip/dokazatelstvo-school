import { PrimaryButton } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Новый пароль — Доказательство", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token || error) {
    return (
      <AuthCard title="Ссылка устарела" subtitle="Ссылка для смены пароля недействительна или истекла. Запросите новую.">
        <PrimaryButton href="/forgot-password">Запросить ссылку</PrimaryButton>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Новый пароль" subtitle="После смены пароля все остальные устройства выйдут из аккаунта.">
      <ResetForm token={token} />
    </AuthCard>
  );
}
