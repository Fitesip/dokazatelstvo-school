/** Общие настройки базы — используются и приложением, и скриптами (миграции, сиды). */
export const dbUrl = process.env.DATABASE_URL || "pglite:./.data/pglite";
export const isPglite = dbUrl.startsWith("pglite:");
