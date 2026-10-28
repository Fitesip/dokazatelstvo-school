import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import { dbUrl } from "./config";
import * as schema from "./schema";

/** Подключение к PostgreSQL (локально его поднимает `npm run dev`, на сервере — docker-compose). */
function create() {
  return drizzle({ connection: { url: dbUrl, max: 10 }, schema });
}

type Db = ReturnType<typeof create>;

// в dev Next.js перезагружает модули — держим один пул подключений на процесс
const globalForDb = globalThis as unknown as { __db?: Db };
export const db: Db = globalForDb.__db ?? create();
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export { schema };
