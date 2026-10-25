import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/session";
import { readStored } from "@/lib/storage";

const { file, questionImage, question, assignment, enrollment, answerFile, submission } = schema;

/** Можно ли пользователю видеть файл. */
async function canRead(f: typeof file.$inferSelect, userId: string, isTeacher: boolean) {
  if (isTeacher || f.ownerId === userId) return true;

  if (f.kind === "question") {
    // картинка к вопросу: ученик курса, ДЗ опубликовано
    const [row] = await db
      .select({ productId: assignment.productId })
      .from(questionImage)
      .innerJoin(question, eq(question.id, questionImage.questionId))
      .innerJoin(assignment, eq(assignment.id, question.assignmentId))
      .innerJoin(enrollment, and(eq(enrollment.productId, assignment.productId), eq(enrollment.userId, userId)))
      .where(and(eq(questionImage.fileId, f.id), eq(assignment.status, "published")))
      .limit(1);
    return !!row;
  }

  // решение ученика: только автор работы (и преподаватель — выше)
  const [row] = await db
    .select({ userId: submission.userId })
    .from(answerFile)
    .innerJoin(submission, eq(submission.id, answerFile.submissionId))
    .where(eq(answerFile.fileId, f.id))
    .limit(1);
  return row?.userId === userId;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Нужен вход", { status: 401 });

  const { id } = await params;
  const [f] = await db.select().from(file).where(eq(file.id, id));
  if (!f || !(await canRead(f, session.user.id, session.user.role === "teacher"))) {
    return new NextResponse("Не найдено", { status: 404 });
  }

  const data = await readStored(f).catch(() => null);
  if (!data) return new NextResponse("Файл потерян", { status: 404 });

  // HEIC браузеры (кроме Safari) не показывают — отдаём на скачивание
  const inline = f.mime !== "image/heic";
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": f.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
