import Link from "next/link";
import { notFound } from "next/navigation";
import { createAssignmentAction } from "@/app/actions/admin";
import { PrimarySubmit } from "@/components/Button";
import { LessonControl } from "@/components/cabinet/LessonControl";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td } from "@/components/cabinet/Table";
import { getCourse } from "@/lib/courses";
import { courseJournal, listAssignments } from "@/lib/homework";
import { liveLesson } from "@/lib/lessons";

const dueText = (d: Date | null) =>
  d ? `до ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" })}` : "без срока";

export default async function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();
  const [live, all, journal] = await Promise.all([liveLesson(id), listAssignments(id), courseJournal(id)]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link href="/admin/courses" className="text-[13px] text-text/60 hover:text-blue">
          ← Все курсы
        </Link>
        <PageTitle>{course.title}</PageTitle>
        <LessonControl productId={id} liveId={live?.id ?? null} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[19px] font-bold text-text">Домашние задания</h2>
          <form action={createAssignmentAction}>
            <input type="hidden" name="productId" value={id} />
            <PrimarySubmit type="submit" size="sm">
              + Новое ДЗ
            </PrimarySubmit>
          </form>
        </div>
        {all.length === 0 ? (
          <p className="text-[15px] text-text/60">ДЗ пока нет.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-card-line border-y border-card-line">
            {all.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/homework/${a.id}`} className="font-bold text-blue hover:underline">
                  {a.title}
                </Link>
                <span className="text-[13px] text-text/60">
                  {a.status === "published" ? <span className="text-green">опубликовано</span> : "черновик"} ·{" "}
                  {dueText(a.dueAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Журнал</h2>
        {journal.students.length === 0 ? (
          <p className="text-[15px] text-text/60">У курса пока нет учеников.</p>
        ) : (
          <Table head={["Ученик", ...journal.assignments.map((a) => a.title)]}>
            {journal.students.map((s) => (
              <tr key={s.id}>
                <Td className="font-bold">{s.name}</Td>
                {journal.assignments.map((a) => {
                  const sub = journal.cell(s.id, a.id);
                  return (
                    <Td key={a.id}>
                      {!sub ? (
                        <span className="text-text/40">—</span>
                      ) : sub.status === "checked" ? (
                        <Link href={`/admin/review/${sub.id}`} className="text-[17px] font-bold text-blue hover:underline">
                          {sub.grade}
                        </Link>
                      ) : (
                        <Link href={`/admin/review/${sub.id}`} className="text-[13px] font-bold text-gold hover:underline">
                          проверить
                        </Link>
                      )}
                    </Td>
                  );
                })}
              </tr>
            ))}
          </Table>
        )}
        {journal.students.length > 0 && journal.assignments.length === 0 && (
          <p className="text-[13px] text-text/50">Оценки появятся после публикации ДЗ.</p>
        )}
      </section>
    </>
  );
}
