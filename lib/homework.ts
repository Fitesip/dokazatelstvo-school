import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import {
  shortIsCorrect,
  validateForPublish,
  type EditorAssignment,
  type EditorQuestion,
} from "./homework-shared";
import { MAX_FILES_PER_ANSWER } from "./storage";

export type { EditorAssignment, EditorOption, EditorQuestion } from "./homework-shared";

const { assignment, question, questionOption, questionImage, submission, answer, answerFile, file, product, user, enrollment } =
  schema;

export class HomeworkError extends Error {}

/* ================= Чтение ================= */

export async function getAssignmentFull(id: string) {
  const [a] = await db.select().from(assignment).where(eq(assignment.id, id));
  if (!a) return null;
  const qs = await db.select().from(question).where(eq(question.assignmentId, id)).orderBy(asc(question.position));
  const ids = qs.map((q) => q.id);
  const [opts, imgs] = ids.length
    ? await Promise.all([
        db.select().from(questionOption).where(inArray(questionOption.questionId, ids)).orderBy(asc(questionOption.position)),
        db.select().from(questionImage).where(inArray(questionImage.questionId, ids)).orderBy(asc(questionImage.position)),
      ])
    : [[], []];
  const questions: EditorQuestion[] = qs.map((q) => ({
    id: q.id,
    kind: q.kind,
    text: q.text,
    accepted: q.accepted,
    options: opts.filter((o) => o.questionId === q.id).map((o) => ({ id: o.id, text: o.text, correct: o.correct })),
    images: imgs.filter((i) => i.questionId === q.id).map((i) => i.fileId),
  }));
  const [{ n }] = await db.select({ n: count() }).from(submission).where(eq(submission.assignmentId, id));
  return { ...a, questions, submissions: n };
}

export async function listAssignments(productId: string, publishedOnly = false) {
  const where = publishedOnly
    ? and(eq(assignment.productId, productId), eq(assignment.status, "published"))
    : eq(assignment.productId, productId);
  return db.select().from(assignment).where(where).orderBy(asc(assignment.createdAt));
}

/* ================= Конструктор ================= */

export async function createAssignment(productId: string) {
  const id = randomUUID();
  const [{ n }] = await db.select({ n: count() }).from(assignment).where(eq(assignment.productId, productId));
  await db.insert(assignment).values({ id, productId, title: `ДЗ ${n + 1}` });
  return id;
}

/**
 * Сохраняет ДЗ целиком. Пока работ нет — можно менять всё; после первой сданной
 * работы вопросы фиксируются (иначе поедут ответы), меняются только название, описание и срок.
 */
export async function saveAssignment(id: string, data: EditorAssignment) {
  const current = await getAssignmentFull(id);
  if (!current) throw new HomeworkError("ДЗ не найдено.");
  const dueAt = data.dueDate ? new Date(`${data.dueDate}T23:59:00+03:00`) : null;

  await db.transaction(async (tx) => {
    await tx
      .update(assignment)
      .set({ title: data.title.trim() || current.title, description: data.description.trim(), dueAt })
      .where(eq(assignment.id, id));
    if (current.submissions > 0) return;

    // картинки — только загруженные как «картинка к вопросу»
    const imageIds = [...new Set(data.questions.flatMap((q) => q.images))];
    if (imageIds.length) {
      const ok = await tx
        .select({ id: file.id })
        .from(file)
        .where(and(inArray(file.id, imageIds), eq(file.kind, "question")));
      if (ok.length !== imageIds.length) throw new HomeworkError("Некоторые картинки не найдены — загрузите их заново.");
    }

    const keep = data.questions.map((q) => q.id);
    const old = current.questions.map((q) => q.id).filter((qid) => !keep.includes(qid));
    if (old.length) await tx.delete(question).where(inArray(question.id, old));

    for (const [position, q] of data.questions.entries()) {
      const row = {
        assignmentId: id,
        position,
        kind: q.kind,
        text: q.text.trim(),
        accepted: q.kind === "short" ? q.accepted.map((x) => x.trim()).filter(Boolean) : [],
      };
      await tx.insert(question).values({ id: q.id, ...row }).onConflictDoUpdate({ target: question.id, set: row });
      await tx.delete(questionOption).where(eq(questionOption.questionId, q.id));
      await tx.delete(questionImage).where(eq(questionImage.questionId, q.id));
      const options = q.kind === "choice" ? q.options.filter((o) => o.text.trim()) : [];
      if (options.length) {
        await tx.insert(questionOption).values(
          options.map((o, i) => ({ id: o.id, questionId: q.id, position: i, text: o.text.trim(), correct: o.correct })),
        );
      }
      if (q.images.length) {
        await tx
          .insert(questionImage)
          .values(q.images.map((fileId, i) => ({ questionId: q.id, fileId, position: i })));
      }
    }
  });
}

export async function setPublished(id: string, published: boolean) {
  const a = await getAssignmentFull(id);
  if (!a) throw new HomeworkError("ДЗ не найдено.");
  if (published) {
    const errors = validateForPublish({ ...a, dueDate: "", description: a.description });
    if (errors.length) throw new HomeworkError(errors.join(" "));
    await db.update(assignment).set({ status: "published", publishedAt: new Date() }).where(eq(assignment.id, id));
  } else {
    if (a.submissions > 0) throw new HomeworkError("Нельзя снять с публикации: ученики уже сдали работы.");
    await db.update(assignment).set({ status: "draft" }).where(eq(assignment.id, id));
  }
  return a.productId;
}

export async function deleteAssignment(id: string) {
  const a = await getAssignmentFull(id);
  if (!a) return null;
  if (a.submissions > 0) throw new HomeworkError("Нельзя удалить: ученики уже сдали работы.");
  await db.delete(assignment).where(eq(assignment.id, id));
  return a.productId;
}

/* ================= Ученик ================= */

export interface StudentAnswer {
  questionId: string;
  optionIds?: string[];
  text?: string;
  fileIds?: string[];
}

export async function getSubmission(assignmentId: string, userId: string) {
  const [s] = await db
    .select()
    .from(submission)
    .where(and(eq(submission.assignmentId, assignmentId), eq(submission.userId, userId)));
  if (!s) return null;
  return { ...s, ...(await submissionAnswers(s.id)) };
}

async function submissionAnswers(submissionId: string) {
  const answers = await db.select().from(answer).where(eq(answer.submissionId, submissionId));
  const files = await db
    .select({ questionId: answerFile.questionId, id: file.id, name: file.name, mime: file.mime, size: file.size })
    .from(answerFile)
    .innerJoin(file, eq(file.id, answerFile.fileId))
    .where(eq(answerFile.submissionId, submissionId));
  return { answers, files };
}

/** Одна попытка: сдаёт работу и сразу проверяет вопросы с автопроверкой. */
export async function submitHomework(assignmentId: string, userId: string, input: StudentAnswer[]) {
  const a = await getAssignmentFull(assignmentId);
  if (!a || a.status !== "published") throw new HomeworkError("ДЗ не найдено.");
  const [enrolled] = await db
    .select()
    .from(enrollment)
    .where(and(eq(enrollment.userId, userId), eq(enrollment.productId, a.productId)));
  if (!enrolled) throw new HomeworkError("Нет доступа к этому курсу.");
  if (await getSubmission(assignmentId, userId)) throw new HomeworkError("Работа уже сдана — попытка одна.");

  const byId = new Map(input.map((x) => [x.questionId, x]));
  const allFileIds = input.flatMap((x) => x.fileIds ?? []);
  if (allFileIds.length) {
    const own = await db
      .select({ id: file.id })
      .from(file)
      .leftJoin(answerFile, eq(answerFile.fileId, file.id))
      .where(and(inArray(file.id, allFileIds), eq(file.ownerId, userId), eq(file.kind, "submission"), isNull(answerFile.fileId)));
    if (own.length !== new Set(allFileIds).size) throw new HomeworkError("Некоторые файлы не найдены — загрузите их заново.");
  }

  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(submission).values({ id, assignmentId, userId });
    for (const q of a.questions) {
      const given = byId.get(q.id);
      const optionIds = (given?.optionIds ?? []).filter((oid) => q.options.some((o) => o.id === oid));
      const text = (given?.text ?? "").slice(0, 5000);
      let autoCorrect: boolean | null = null;
      if (q.kind === "choice") {
        const correct = q.options.filter((o) => o.correct).map((o) => o.id).sort();
        autoCorrect = JSON.stringify([...optionIds].sort()) === JSON.stringify(correct);
      } else if (q.kind === "short") {
        autoCorrect = shortIsCorrect(text, q.accepted);
      }
      await tx.insert(answer).values({ submissionId: id, questionId: q.id, optionIds, text, autoCorrect });
      const fileIds = q.kind === "long" ? [...new Set(given?.fileIds ?? [])].slice(0, MAX_FILES_PER_ANSWER) : [];
      if (fileIds.length) {
        await tx.insert(answerFile).values(fileIds.map((fileId) => ({ submissionId: id, questionId: q.id, fileId })));
      }
    }
  });
  return id;
}

/* ================= Проверка преподавателем ================= */

export async function pendingSubmissions() {
  return db
    .select({
      id: submission.id,
      submittedAt: submission.submittedAt,
      student: user.name,
      assignment: assignment.title,
      course: product.title,
    })
    .from(submission)
    .innerJoin(user, eq(user.id, submission.userId))
    .innerJoin(assignment, eq(assignment.id, submission.assignmentId))
    .innerJoin(product, eq(product.id, assignment.productId))
    .where(eq(submission.status, "submitted"))
    .orderBy(asc(submission.submittedAt));
}

export async function getSubmissionForReview(id: string) {
  const [row] = await db
    .select({ submission, student: user.name, email: user.email })
    .from(submission)
    .innerJoin(user, eq(user.id, submission.userId))
    .where(eq(submission.id, id));
  if (!row) return null;
  const a = await getAssignmentFull(row.submission.assignmentId);
  if (!a) return null;
  return { ...row, assignment: a, ...(await submissionAnswers(id)) };
}

export async function gradeSubmission(id: string, grade: number, comment: string, teacherId: string) {
  if (!Number.isInteger(grade) || grade < 1 || grade > 5) throw new HomeworkError("Оценка — от 1 до 5.");
  await db
    .update(submission)
    .set({ status: "checked", grade, comment: comment.trim().slice(0, 5000) || null, checkedAt: new Date(), checkedBy: teacherId })
    .where(eq(submission.id, id));
}

/* ================= Журнал курса ================= */

export async function courseJournal(productId: string) {
  const assignments = await listAssignments(productId, true);
  const students = await db
    .select({ id: user.id, name: user.name })
    .from(enrollment)
    .innerJoin(user, eq(user.id, enrollment.userId))
    .where(eq(enrollment.productId, productId))
    .orderBy(asc(user.name));
  const subs = assignments.length
    ? await db
        .select()
        .from(submission)
        .where(inArray(submission.assignmentId, assignments.map((a) => a.id)))
        .orderBy(desc(submission.submittedAt))
    : [];
  const cell = (studentId: string, assignmentId: string) =>
    subs.find((s) => s.userId === studentId && s.assignmentId === assignmentId) ?? null;
  return { assignments, students, cell };
}
