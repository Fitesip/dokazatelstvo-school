import { defineConfig } from "drizzle-kit";

// Генерация SQL-миграций из lib/db/schema.ts: npm run db:generate
// Применяются они скриптом scripts/migrate.ts (npm run db:migrate).
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
});
