import { and, eq, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { Calendar, type CalEvent } from "@/components/cabinet/Calendar";
import { LiveLessons } from "@/components/cabinet/LiveLessons";
import { PageTitle } from "@/components/cabinet/Shell";
import { FormNote } from "@/components/ui/Field";
import { db, schema } from "@/lib/db";
import { dueDate, dueTime } from "@/lib/due";
import { liveLessonsFor } from "@/lib/lessons";
import { getEnrollments } from "@/lib/orders";
import { requireUser } from "@/lib/session";

/** Сроки опубликованных ДЗ по купленным номерам — события календаря. */
async function deadlineEvents(userId: string): Promise<CalEvent[]> {
  const { assignment, enrollment, product, submission } = schema;
  const rows = await db
    .select({
      id: assignment.id,
      title: assignment.title,
      dueAt: assignment.dueAt,
      dueHasTime: assignment.dueHasTime,
      course: product.title,
      status: submission.status,
    })
    .from(assignment)
    .innerJoin(enrollment, and(eq(enrollment.productId, assignment.productId), eq(enrollment.userId, userId)))
    .innerJoin(product, eq(product.id, assignment.productId))
    .leftJoin(submission, and(eq(submission.assignmentId, assignment.id), eq(submission.userId, userId)))
    .where(and(eq(assignment.status, "published"), isNotNull(assignment.dueAt)));
  return rows.map((r) => ({
    date: dueDate(r.dueAt!),
    time: r.dueHasTime ? dueTime(r.dueAt!) : undefined,
    title: `Срок ДЗ: ${r.title}`,
    subtitle: `${r.course} · ${r.status === "checked" ? "проверено" : r.status === "submitted" ? "сдано" : "не сдано"}`,
    color: r.status ? "green" : "gold",
  }));
}

export default async function CabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; paid?: string }>;
}) {
  const { user } = await requireUser("/cabinet");
  const { welcome, paid } = await searchParams;
  const [items, events, live] = await Promise.all([
    getEnrollments(user.id),
    deadlineEvents(user.id),
    liveLessonsFor(user.id, user.role === "teacher"),
  ]);

  return (
    <>
      <PageTitle subtitle="Уроки, домашние задания и оценки — здесь.">
        Здравствуйте, {user.name.split(" ")[0]}!
      </PageTitle>

      <LiveLessons initial={live.map((l) => ({ id: l.id, title: l.title, callUrl: l.callUrl }))} />

      {welcome && <FormNote>Аккаунт создан, покупка добавлена. Добро пожаловать!</FormNote>}
      {paid && !welcome && <FormNote>Оплата прошла — новые номера уже в списке ниже.</FormNote>}
      {!user.emailVerified && (
        <FormNote>Подтвердите e-mail: ссылка в письме от «Доказательство». Это нужно для восстановления пароля.</FormNote>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Мои номера</h2>
        {items.length === 0 ? (
          <p className="text-[15px] text-text/60">Пока ничего не куплено.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/cabinet/course/${p.id}`} className="glow-line-red group flex flex-col gap-1 py-2 pl-5">
                  <span className="text-[12px] font-bold uppercase tracking-wide text-accent">{p.exam}</span>
                  <span className="glow-blue text-[18px] font-bold text-blue group-hover:underline">{p.title}</span>
                  <span className="text-[13px] text-text/60">ДЗ и оценки →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Календарь</h2>
        <Calendar events={events} />
        <p className="text-[12px] text-text/50">В календаре — сроки сдачи ДЗ. Расписание занятий добавим позже.</p>
      </section>
    </>
  );
}
