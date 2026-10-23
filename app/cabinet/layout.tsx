import { Shell } from "@/components/cabinet/Shell";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Личный кабинет — Доказательство", robots: { index: false } };

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser("/cabinet");
  return (
    <Shell
      userName={user.name}
      nav={[
        { href: "/cabinet", label: "Главная" },
        { href: "/cabinet/security", label: "Безопасность" },
      ]}
      extra={user.role === "teacher" ? { href: "/admin", label: "Админка →" } : undefined}
    >
      {children}
    </Shell>
  );
}
