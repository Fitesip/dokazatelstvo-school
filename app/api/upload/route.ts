import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { UploadError, saveUpload } from "@/lib/storage";
import type { FileKind } from "@/lib/db/schema";

/**
 * Загрузка одного файла: POST multipart/form-data, поле «file», ?kind=question|submission.
 * Картинки к вопросам грузит только преподаватель, решения — любой вошедший ученик.
 * Файл пока ни к чему не привязан — привязка происходит при сохранении ДЗ / сдаче работы.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });

  const kind = new URL(req.url).searchParams.get("kind") as FileKind | null;
  if (kind !== "question" && kind !== "submission") {
    return NextResponse.json({ error: "Неизвестный тип загрузки." }, { status: 400 });
  }
  if (kind === "question" && session.user.role !== "teacher") {
    return NextResponse.json({ error: "Нет доступа." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const f = form?.get("file");
  if (!(f instanceof File)) return NextResponse.json({ error: "Файл не получен." }, { status: 400 });

  try {
    const saved = await saveUpload({
      data: Buffer.from(await f.arrayBuffer()),
      name: f.name,
      kind,
      ownerId: session.user.id,
    });
    return NextResponse.json(saved);
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
