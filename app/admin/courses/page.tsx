import { count, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { LessonControl } from "@/components/cabinet/LessonControl";
import { PageTitle } from "@/components/cabinet/Shell";
import { listCourses } from "@/lib/courses";
import { db, schema } from "@/lib/db";

export default async function CoursesPage() {
  const courses = await listCourses();
  const students = await db
    .select({ productId: schema.enrollment.productId, n: count() })
    .from(schema.enrollment)
    .groupBy(schema.enrollment.productId);
  const live = await db.select().from(schema.lesson).where(isNull(schema.lesson.endedAt));
  const homework = await db
    .select({ productId: schema.assignment.productId, n: count() })
    .from(schema.assignment)
    .where(eq(schema.assignment.status, "published"))
    .groupBy(schema.assignment.productId);

  const num = (rows: { productId: string; n: number }[], id: string) => rows.find((r) => r.productId === id)?.n ?? 0;

  return (
    <>
      <PageTitle subtitle="Курс — это номер экзамена. Купленные наборы раскрываются в номера.">Курсы и уроки</PageTitle>
      <ul className="flex flex-col gap-3">
        {courses.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[3px] border border-card-line bg-ink/60 px-5 py-4"
          >
            <div className="flex flex-col gap-1">
              <Link href={`/admin/courses/${c.id}`} className="glow-blue text-[18px] font-bold text-blue hover:underline">
                {c.title}
              </Link>
              <span className="text-[13px] text-text/60">
                учеников: {num(students, c.id)} · ДЗ опубликовано: {num(homework, c.id)}
              </span>
            </div>
            <LessonControl productId={c.id} liveId={live.find((l) => l.productId === c.id)?.id ?? null} />
          </li>
        ))}
      </ul>
    </>
  );
}
