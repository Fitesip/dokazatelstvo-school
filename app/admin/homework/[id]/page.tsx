import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courses";
import { dueDate, dueTime } from "@/lib/due";
import { getAssignmentFull } from "@/lib/homework";
import { HomeworkEditor } from "./HomeworkEditor";

export default async function HomeworkEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAssignmentFull(id);
  if (!a) notFound();
  const course = await getCourse(a.productId);

  return (
    <>
      <Link href={`/admin/courses/${a.productId}`} className="text-[13px] text-text/60 hover:text-blue">
        ← {course?.title ?? "Курс"}
      </Link>
      <HomeworkEditor
        id={a.id}
        published={a.status === "published"}
        locked={a.submissions > 0}
        initial={{
          title: a.title,
          description: a.description,
          dueDate: a.dueAt ? dueDate(a.dueAt) : "",
          dueTime: a.dueAt && a.dueHasTime ? dueTime(a.dueAt) : "",
          questions: a.questions,
        }}
      />
    </>
  );
}
