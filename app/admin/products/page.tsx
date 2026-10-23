import { asc } from "drizzle-orm";
import { PageTitle } from "@/components/cabinet/Shell";
import { db, schema } from "@/lib/db";
import { ProductForm } from "./ProductForm";

export default async function ProductsPage() {
  const products = await db.select().from(schema.product).orderBy(asc(schema.product.sort));
  const items = await db.select().from(schema.bundleItem);
  const titles = new Map(products.map((p) => [p.id, p.title]));
  const composition = (id: string) =>
    items.filter((i) => i.bundleId === id).map((i) => titles.get(i.productId) ?? i.productId);

  return (
    <>
      <PageTitle subtitle="Названия и цены — временные, замените на настоящие. Цена в заказе фиксируется в момент покупки.">
        Номера и наборы
      </PageTitle>
      <div className="flex flex-col gap-4">
        {products.map((p) => (
          <ProductForm
            key={p.id}
            product={{
              id: p.id,
              kind: p.kind,
              title: p.title,
              description: p.description,
              price: p.price,
              active: p.active,
              composition: p.kind === "bundle" ? composition(p.id) : [],
            }}
          />
        ))}
      </div>
    </>
  );
}
