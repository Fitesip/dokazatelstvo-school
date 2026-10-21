/**
 * Применяет SQL-миграции из ./drizzle к базе из DATABASE_URL.
 * Запуск: npm run db:migrate  (в Docker — автоматически при старте контейнера)
 */
import { mkdirSync } from "node:fs";
import { dbUrl, isPglite } from "../lib/db/config";

async function main() {
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
