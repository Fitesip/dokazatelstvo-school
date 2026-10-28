/**
 * npm run dev — локальная разработка без Docker.
 *
 * Поднимает настоящий PostgreSQL 16 (пакет embedded-postgres — официальные сборки
 * под Windows/Linux/macOS) с данными в ./.data/pg на 127.0.0.1:5433, применяет
 * миграции, в новую базу заливает демо-каталог и запускает Next.js.
 * Сайт и скрипты (db:seed, teacher:create) подключаются к базе так же, как на сервере.
 *
 *   npm run dev            — база + Next.js
 *   npm run dev -- --db    — только база
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import EmbeddedPostgres from "embedded-postgres";

const DATA_DIR = process.env.PG_DEV_DIR || "./.data/pg";
const PORT = Number(process.env.PG_DEV_PORT || 5433);
const HOST = "127.0.0.1";
const URL = `postgres://postgres:postgres@${HOST}:${PORT}/postgres`;

const onlyDb = process.argv.includes("--db");
const nextArgs = process.argv.slice(2).filter((a) => a !== "--db");
const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || URL };

const portOpen = () =>
  new Promise((resolve) => {
    const s = net.connect(PORT, HOST);
    s.once("connect", () => (s.destroy(), resolve(true)));
    s.once("error", () => resolve(false));
  });

const children = [];
// одной строкой через shell: на Windows npm/npx — это .cmd, без shell их не запустить
const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn([cmd, ...args].join(" "), { stdio: "inherit", env, shell: true });
    children.push(child);
    child.on("exit", (code) => resolve(code ?? 0));
  });

// 1. база: если уже запущена (второй npm run dev или осталась после сбоя) — подключаемся к ней
let pg = null;
const fresh = !existsSync(DATA_DIR);
if (await portOpen()) {
  console.log(`▶ PostgreSQL уже запущен на ${HOST}:${PORT} — используем его.`);
} else {
  pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: PORT,
    user: "postgres",
    password: "postgres",
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: () => {},
    onError: (e) => console.error("[postgres]", String(e).trim()),
  });
  if (fresh) await pg.initialise();
  await pg.start();
  console.log(`▶ PostgreSQL 16: ${DATA_DIR} → ${URL}${fresh ? " (новая база)" : ""}`);
}

// 2. миграции и демо-каталог
if ((await run("node", ["scripts/migrate.mjs"])) !== 0) await shutdown(1);
if (fresh) {
  await run("npm", ["run", "db:seed"]);
  console.log('▶ Преподаватель: npm run teacher:create -- email "Имя" пароль  (в соседнем терминале)');
}

// 3. Next.js
if (!onlyDb) {
  run("npx", ["next", "dev", ...nextArgs]).then((code) => shutdown(code));
}

let closing = false;
async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const c of children) if (c.exitCode === null) c.kill();
  if (pg) {
    await pg.stop().catch(() => {});
    console.log("■ PostgreSQL остановлен.");
  }
  process.exit(code);
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) process.on(sig, () => void shutdown(0));
