/**
 * Применяет SQL-миграции из ./drizzle к базе из DATABASE_URL.
 * На сервере запускается автоматически при старте контейнера.
 * Локально не нужен: `npm run dev` применяет миграции сам при запуске.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/postgres";
const db = drizzle({ connection: { url: dbUrl, max: 1 } });
await migrate(db, { migrationsFolder: "./drizzle" });
await db.$client.end();
console.log("Миграции применены:", dbUrl.replace(/\/\/[^@]*@/, "//***@"));
