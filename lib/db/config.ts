/**
 * Адрес базы — используется и приложением, и скриптами.
 * Локально по умолчанию — PostgreSQL, который поднимает `npm run dev` (scripts/dev.mjs);
 * на сервере — PostgreSQL из docker-compose.
 */
export const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/postgres";
