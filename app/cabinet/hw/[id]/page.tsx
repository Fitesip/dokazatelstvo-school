import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/cabinet/Shell";
import { FormNote } from "@/components/ui/Field";
import { isEnrolled } from "@/lib/courses";
import { formatDue } from "@/lib/due";
import { getAssignmentFull, getSubmission } from "@/lib/homework";
import { requireUser } from "@/lib/session";
import { HomeworkForm, type StudentQuestion } from "./HomeworkForm";
import { HomeworkResult } from "./HomeworkResult";

export default async function StudentHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser(`/cabinet/hw/${id}`);
  const a = await getAssignmentFull(id);
  if (!a || a.status !== "published" || !(await isEnrolled(user.id, a.productId))) notFound();

  const sub = await getSubmission(id, user.id);
  const due = a.dueAt ? formatDue(a.dueAt, a.dueHasTime) : null;

  // до проверки в браузер не уходят ни отметки правильных вариантов, ни правильные ответы
  const questions: StudentQuestion[] = a.questions.map((q) => ({
    id: q.id,
    kind: q.kind,
    text: q.text,
    images: q.images,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    multiple: q.options.filter((o) => o.correct).length > 1,
  }));

  return (
    <>
      <Link href={`/cabinet/course/${a.productId}`} className="text-[13px] text-text/60 hover:text-blue">
        ← К курсу
      </Link>
      <PageTitle subtitle={due ? `Срок сдачи — ${due}` : undefined}>{a.title}</PageTitle>
      {a.description && <p className="whitespace-pre-line text-[15px] leading-[24px] text-text/80">{a.description}</p>}

      {!sub && (
        <>
          <FormNote>Попытка одна: после отправки изменить ответы нельзя.</FormNote>
          <HomeworkForm assignmentId={id} questions={questions} />
        </>
      )}

      {sub && (
        <HomeworkResult
          checked={sub.status === "checked"}
          grade={sub.grade}
          comment={sub.comment}
          questions={questions.map((q) => {
            const full = a.questions.find((x) => x.id === q.id)!;
            const ans = sub.answers.find((x) => x.questionId === q.id);
            const showKey = sub.status === "checked";
            return {
              ...q,
              given: { optionIds: ans?.optionIds ?? [], text: ans?.text ?? "" },
              files: sub.files.filter((f) => f.questionId === q.id),
              // правильные ответы и отметка «верно/неверно» — только после проверки
              autoCorrect: showKey ? (ans?.autoCorrect ?? null) : null,
              correctOptionIds: showKey ? full.options.filter((o) => o.correct).map((o) => o.id) : [],
              accepted: showKey ? full.accepted : [],
            };
          })}
        />
      )}
    </>
  );
}
