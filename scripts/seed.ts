/**
 * Демо-каталог: отдельные номера ЕГЭ и пара наборов со скидкой.
 * Названия и цены — заглушки, пока клиентка не прислала настоящие.
 * Запуск: npm run db:seed  (повторный запуск обновляет записи, не дублирует)
 */
import { sql } from "drizzle-orm";
import { db, schema } from "../lib/db";

const TASKS = [13, 14, 15, 16, 17, 18, 19].map((n, i) => ({
  id: `ege-${n}`,
  kind: "task" as const,
  exam: "ЕГЭ" as const,
  title: `Задание №${n}`,
  description: `Разбор задания №${n} профильной математики: теория, типовые задачи, ДЗ.`,
  price: 1500,
  sort: 100 + i,
}));

const BUNDLES = [
  { id: "ege-13-16", title: "Набор №13–16", items: [13, 14, 15, 16], sort: 10 },
  { id: "ege-15-18", title: "Набор №15–18", items: [15, 16, 17, 18], sort: 20 },
].map((b) => ({
  ...b,
  kind: "bundle" as const,
  exam: "ЕГЭ" as const,
  description: `Номера ${b.items.map((n) => `№${n}`).join(", ")} со скидкой 20%.`,
  price: Math.round((b.items.length * 1500 * 0.8) / 100) * 100,
}));

async function main() {
  const rows = [...TASKS, ...BUNDLES.map(({ items: _items, ...p }) => p)];
  await db
    .insert(schema.product)
    .values(rows)
    .onConflictDoUpdate({
      target: schema.product.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        price: sql`excluded.price`,
        sort: sql`excluded.sort`,
      },
    });
  for (const b of BUNDLES) {
    await db
      .insert(schema.bundleItem)
      .values(b.items.map((n) => ({ bundleId: b.id, productId: `ege-${n}` })))
      .onConflictDoNothing();
  }
  console.log(`Каталог: ${TASKS.length} номеров, ${BUNDLES.length} набора.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
