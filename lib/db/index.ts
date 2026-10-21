import "server-only";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { dbUrl, isPglite } from "./config";
import * as schema from "./schema";

/**
 * Подключение к базе.
 * - DATABASE_URL=postgres://…  → настоящий PostgreSQL (сервер, Docker)
 * - DATABASE_URL=pglite:./путь → PostgreSQL внутри Node (разработка без Docker)
 */
function create() {
  if (isPglite) {
    return drizzlePglite({ connection: { dataDir: dbUrl.slice("pglite:".length) }, schema });
  }
  return drizzlePostgres({ connection: { url: dbUrl, max: 10 }, schema });
}

type Db = ReturnType<typeof drizzlePostgres<typeof schema>>;

// в dev Next.js перезагружает модули — держим одно подключение на процесс
const globalForDb = globalThis as unknown as { __db?: Db };
export const db: Db = globalForDb.__db ?? (create() as unknown as Db);
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export { schema };
