import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { buyAction } from "@/app/actions/shop";
import { PrimarySubmit } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { db, schema } from "@/lib/db";
import { isDemoShop } from "@/lib/demo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Демо-витрина — Доказательство", robots: { index: false } };

/**
 * Временная витрина для проверки покупки, пока каталог не свёрстан
 * (ждём названия наборов от клиентки). Работает только при DEMO_SHOP=1.
 */
export default async function DemoShopPage() {
  if (!isDemoShop()) notFound();
  const products = await db
    .select()
    .from(schema.product)
    .orderBy(asc(schema.product.sort));

  return (
    <AuthCard
      wide
      title="Демо-витрина"
      subtitle="Временная страница для проверки покупки: каталог появится, когда будут готовы названия наборов."
    >
      <ul className="flex flex-col divide-y divide-card-line border-y border-card-line">
        {products.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="font-bold text-text">
                {p.title}
                {p.kind === "bundle" && (
                  <span className="ml-2 rounded-[2px] bg-accent/15 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                    набор
                  </span>
                )}
              </span>
              <span className="truncate text-[13px] text-text/60">{p.description}</span>
            </div>
            <form action={buyAction} className="flex shrink-0 items-center gap-3">
              <input type="hidden" name="productId" value={p.id} />
              <span className="text-[15px] font-bold text-blue">{p.price.toLocaleString("ru-RU")} ₽</span>
              <PrimarySubmit size="sm" type="submit">
                Купить
              </PrimarySubmit>
            </form>
          </li>
        ))}
      </ul>
    </AuthCard>
  );
}
