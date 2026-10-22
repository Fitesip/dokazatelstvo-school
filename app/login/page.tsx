import { redirect } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Вход — Доказательство", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string; next?: string; reset?: string }>;
}) {
  const { claim, next, reset } = await searchParams;
  // уже вошли и не нужно привязывать покупку — сразу в кабинет
  if (!claim && (await getSession())) redirect("/cabinet");

  return (
    <AuthCard
      title="Вход в личный кабинет"
      subtitle={claim ? "Войдите — оплаченная покупка добавится в ваш аккаунт." : undefined}
    >
      <LoginForm resetDone={reset === "1"} />
    </AuthCard>
  );
}
