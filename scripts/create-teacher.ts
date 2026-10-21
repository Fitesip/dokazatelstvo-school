/**
 * Создаёт аккаунт преподавателя (публичная регистрация закрыта).
 * Запуск: npm run teacher:create -- <email> "<Имя Фамилия>" <пароль>
 * Если аккаунт с таким e-mail уже есть — просто выдаёт ему роль преподавателя.
 */
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db, schema } from "../lib/db";

async function main() {
  const [email, name, password] = process.argv.slice(2);
  if (!email || !name) {
    console.error('Использование: npm run teacher:create -- <email> "<Имя Фамилия>" <пароль>');
    process.exit(1);
  }

  const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  if (!existing) {
    if (!password || password.length < 8) {
      console.error("Пароль обязателен, минимум 8 символов.");
      process.exit(1);
    }
    await auth.api.signUpEmail({ body: { email, name, password } });
  }
  await db
    .update(schema.user)
    .set({ role: "teacher", emailVerified: true })
    .where(eq(schema.user.email, email));
  console.log(`${existing ? "Роль выдана" : "Создан преподаватель"}: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
