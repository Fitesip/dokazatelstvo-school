/**
 * Применяет SQL-миграции из ./drizzle к базе из DATABASE_URL.
 * Обычный JS, чтобы работать и локально, и в Docker-образе без tsx.
 * Запуск: npm run db:migrate  (в Docker — автоматически при старте контейнера)
 */
import { mkdirSync } from "node:fs";

// те же правила, что в lib/db/config.ts
const dbUrl = process.env.DATABASE_URL || "pglite:./.data/pglite";
const isPglite = dbUrl.startsWith("pglite:");

if (isPglite) {
  const dataDir = dbUrl.slice("pglite:".length);
  mkdirSync(dataDir, { recursive: true });
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle({ connection: { dataDir } });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.$client.close();
} else {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const db = drizzle({ connection: { url: dbUrl, max: 1 } });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.$client.end();
}
console.log("Миграции применены:", isPglite ? dbUrl : dbUrl.replace(/\/\/[^@]*@/, "//***@"));
