import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Для страниц кабинета: без входа — на /login с возвратом обратно. */
export async function requireUser(next: string) {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  return s;
}

/** Для админки: только преподаватель. */
export async function requireTeacher(next: string) {
  const s = await requireUser(next);
  if (s.user.role !== "teacher") redirect("/cabinet");
  return s;
}
