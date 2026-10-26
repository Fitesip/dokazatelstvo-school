import { Shell } from "@/components/cabinet/Shell";
import { requireTeacher } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Админка — Доказательство", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireTeacher("/admin");
  return (
    <Shell
      userName={user.name}
      nav={[
        { href: "/admin", label: "Заявки" },
        { href: "/admin/courses", label: "Курсы и уроки" },
        { href: "/admin/review", label: "Проверка ДЗ" },
        { href: "/admin/orders", label: "Заказы" },
        { href: "/admin/students", label: "Ученики" },
        { href: "/admin/products", label: "Номера и наборы" },
      ]}
      extra={{ href: "/cabinet", label: "← Мой кабинет" }}
    >
      {children}
    </Shell>
  );
}
