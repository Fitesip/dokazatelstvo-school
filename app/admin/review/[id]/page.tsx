import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswersView } from "@/components/cabinet/AnswersView";
import { PageTitle } from "@/components/cabinet/Shell";
import { fmtDate } from "@/components/cabinet/Table";
import { getSubmissionForReview } from "@/lib/homework";
import { GradeForm } from "./GradeForm";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getSubmissionForReview(id);
  if (!r) notFound();
  const { submission: s, assignment: a } = r;

  const auto = r.answers.filter((x) => x.autoCorrect !== null);
  const right = auto.filter((x) => x.autoCorrect).length;
  const manual = a.questions.filter((q) => q.kind === "long").length;

  return (
    <>
      <Link href="/admin/review" className="text-[13px] text-text/60 hover:text-blue">
        ← К очереди
      </Link>
      <PageTitle subtitle={`${r.student} · ${r.email} · сдано ${fmtDate(s.submittedAt)}`}>{a.title}</PageTitle>

      <div className="flex flex-wrap gap-6 text-[15px] text-text">
        {auto.length > 0 && (
          <span>
            Автопроверка: <b className="text-blue">{right} из {auto.length}</b> верно
          </span>
        )}
        {manual > 0 && <span>Развёрнутых решений: {manual}</span>}
      </div>

      <AnswersView
        questions={a.questions.map((q) => {
          const ans = r.answers.find((x) => x.questionId === q.id);
          return {
            id: q.id,
            kind: q.kind,
            text: q.text,
            images: q.images,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
            given: { optionIds: ans?.optionIds ?? [], text: ans?.text ?? "" },
            files: r.files.filter((f) => f.questionId === q.id),
            autoCorrect: ans?.autoCorrect ?? null,
            correctOptionIds: q.options.filter((o) => o.correct).map((o) => o.id),
            accepted: q.accepted,
          };
        })}
      />

      <GradeForm id={s.id} grade={s.grade} comment={s.comment ?? ""} checked={s.status === "checked"} />
    </>
  );
}
