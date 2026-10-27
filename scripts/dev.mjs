/**
 * npm run dev — локальная разработка без Docker.
 *
 * PGlite (PostgreSQL внутри Node) нельзя открывать из нескольких процессов,
 * а Next.js в dev-режиме сам запускает дочерние процессы. Поэтому базу открывает
 * ТОЛЬКО этот скрипт и раздаёт её по протоколу PostgreSQL на 127.0.0.1:5433;
 * сайт и скрипты (db:seed, teacher:create) подключаются к ней как к обычному
 * PostgreSQL — так же, как на сервере.
 *
 *   npm run dev            — база + Next.js
 *   npm run dev -- --db    — только база (например, для скриптов)
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import net from "node:net";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const DATA_DIR = process.env.PGLITE_DIR || "./.data/pglite";
const PORT = Number(process.env.PGLITE_PORT || 5433);
const HOST = "127.0.0.1";
const DEV_DATABASE_URL = `postgres://postgres:postgres@${HOST}:${PORT}/postgres`;

const onlyDb = process.argv.includes("--db");
const nextArgs = process.argv.slice(2).filter((a) => a !== "--db");

// 1. порт свободен? иначе уже работает другой npm run dev — базу не трогаем
const busy = await new Promise((resolve) => {
  const s = net.createServer().once("error", () => resolve(true));
  s.listen(PORT, HOST, () => s.close(() => resolve(false)));
});
if (busy) {
  console.error(
    `\n✖ Порт базы ${PORT} занят — скорее всего, уже запущен другой npm run dev.\n` +
      `  Остановите его (Ctrl+C) или пользуйтесь им: второй экземпляр испортил бы базу.\n`,
  );
  process.exit(1);
}

// 2. открыть базу и применить миграции
const fresh = !existsSync(DATA_DIR);
mkdirSync(DATA_DIR, { recursive: true });
const db = await PGlite.create(DATA_DIR);
await migrate(drizzle({ client: db }), { migrationsFolder: "./drizzle" });

// 3. раздать по сети
const server = new PGLiteSocketServer({ db, host: HOST, port: PORT, maxConnections: 50 });
await server.start();
console.log(`▶ База PGlite: ${DATA_DIR} → ${DEV_DATABASE_URL}${fresh ? " (новая)" : ""}`);

const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || DEV_DATABASE_URL };
const children = [];
const run = (cmd, args) => {
  const child = spawn(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  children.push(child);
  return child;
};

// 4. новая база — сразу демо-каталог
if (fresh) {
  await new Promise((resolve) => run("npm", ["run", "db:seed"]).on("exit", resolve));
  console.log("▶ Преподаватель: npm run teacher:create -- email \"Имя\" пароль  (в соседнем терминале)");
}

// 5. Next.js
if (!onlyDb) {
  run("npx", ["next", "dev", ...nextArgs]).on("exit", (code) => shutdown(code ?? 0));
}

// корректное закрытие: PGlite дописывает данные на диск только при close()
let closing = false;
async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const c of children) if (c.exitCode === null) c.kill();
  await server.stop().catch(() => {});
  await db.close().catch(() => {});
  console.log("■ База закрыта.");
  process.exit(code);
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) process.on(sig, () => void shutdown(0));
