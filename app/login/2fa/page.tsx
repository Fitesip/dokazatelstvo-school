import { AuthCard } from "@/components/ui/AuthCard";
import { TwoFactorForm } from "./TwoFactorForm";

export const metadata = { title: "Код подтверждения — Доказательство", robots: { index: false } };

export default function TwoFactorPage() {
  return (
    <AuthCard
      title="Код из приложения"
      subtitle="Откройте Google Authenticator или Яндекс Ключ и введите 6-значный код для «Доказательство»."
    >
      <TwoFactorForm />
    </AuthCard>
  );
}
