import { and, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/cabinet/Shell";
import { getCourse, isEnrolled } from "@/lib/courses";
import { formatDue } from "@/lib/due";
import { db, schema } from "@/lib/db";
import { listAssignments } from "@/lib/homework";
import { requireUser } from "@/lib/session";

export default async function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser(`/cabinet/course/${id}`);
  const course = await getCourse(id);
  if (!course || !(await isEnrolled(user.id, id))) notFound();

  const list = await listAssignments(id, true);
  const subs = list.length
    ? await db
        .select()
        .from(schema.submission)
        .where(and(eq(schema.submission.userId, user.id), inArray(schema.submission.assignmentId, list.map((a) => a.id))))
    : [];

  return (
    <>
      <Link href="/cabinet" className="text-[13px] text-text/60 hover:text-blue">
        ← Главная
      </Link>
      <PageTitle subtitle={course.description}>{course.title}</PageTitle>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Домашние задания</h2>
        {list.length === 0 ? (
          <p className="text-[15px] text-text/60">Пока ДЗ нет — они появятся здесь, как только преподаватель их опубликует.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-card-line border-y border-card-line">
            {list.map((a) => {
              const s = subs.find((x) => x.assignmentId === a.id);
              const overdue = !s && a.dueAt && a.dueAt < new Date();
              return (
                <li key={a.id}>
                  <Link href={`/cabinet/hw/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-white/[0.03]">
                    <span className="flex flex-col">
                      <span className="text-[16px] font-bold text-blue">{a.title}</span>
                      {a.dueAt && <span className={`text-[13px] ${overdue ? "text-accent" : "text-text/60"}`}>срок — {formatDue(a.dueAt, a.dueHasTime)}</span>}
                    </span>
                    <span className="text-[14px]">
                      {!s && <span className="text-text/70">не начато</span>}
                      {s?.status === "submitted" && <span className="text-gold">на проверке</span>}
                      {s?.status === "checked" && (
                        <span className="text-text">
                          оценка <b className="glow-blue text-[20px] text-blue">{s.grade}</b>
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
