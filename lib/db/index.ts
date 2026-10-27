import "server-only";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { dbUrl, isPglite } from "./config";
import * as schema from "./schema";

/**
 * Подключение к базе.
 * - DATABASE_URL=postgres://…  → настоящий PostgreSQL (сервер, Docker)
 * - DATABASE_URL=pglite:./путь → PostgreSQL внутри Node (разработка без Docker)
 */
/**
 * PGlite нельзя открывать из двух процессов — база портится (два `npm run dev`
 * из одной папки). Держим файл-замок с PID и не даём открыть занятую базу.
 */
function lockPglite(dataDir: string) {
  const lock = `${dataDir}.lock`;
  if (existsSync(lock)) {
    const pid = Number(readFileSync(lock, "utf8"));
    let alive = false;
    try {
      alive = pid !== process.pid && process.kill(pid, 0);
    } catch {
      alive = false; // процесса уже нет — замок остался от «жёсткой» остановки
    }
    if (alive) {
      throw new Error(
        `Локальная база ${dataDir} уже открыта другим процессом (PID ${pid}) — скорее всего, второй npm run dev. ` +
          `Остановите его: PGlite нельзя открывать дважды, база испортится.`,
      );
    }
  }
  mkdirSync(path.dirname(path.resolve(dataDir)), { recursive: true });
  writeFileSync(lock, String(process.pid));
  process.once("exit", () => {
    try {
      if (readFileSync(lock, "utf8") === String(process.pid)) unlinkSync(lock);
    } catch {}
  });
}

function create() {
  if (isPglite) {
    const dataDir = dbUrl.slice("pglite:".length);
    lockPglite(dataDir);
    const db = drizzlePglite({ connection: { dataDir }, schema });
    // PGlite сбрасывает данные на диск при закрытии: без этого «жёсткая»
    // остановка dev-сервера портит базу (лечится npm run db:reset)
    for (const sig of ["SIGINT", "SIGTERM"] as const) {
      process.once(sig, () => void db.$client.close().finally(() => process.exit(0)));
    }
    return db;
  }
  return drizzlePostgres({ connection: { url: dbUrl, max: 10 }, schema });
}

type Db = ReturnType<typeof drizzlePostgres<typeof schema>>;

// в dev Next.js перезагружает модули — держим одно подключение на процесс
const globalForDb = globalThis as unknown as { __db?: Db };
export const db: Db = globalForDb.__db ?? (create() as unknown as Db);
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export { schema };
