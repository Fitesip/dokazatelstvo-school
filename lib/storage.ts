import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, schema } from "./db";
import type { FileKind } from "./db/schema";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./.data/uploads");

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_FILES_PER_ANSWER = 10;

interface Detected {
  mime: string;
  ext: string;
}

/** Тип по первым байтам файла — не доверяем тому, что прислал браузер. */
function detect(buf: Buffer): Detected | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { mime: "image/png", ext: "png" };
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP")
    return { mime: "image/webp", ext: "webp" };
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  const brand = buf.subarray(4, 12).toString("latin1");
  if (/^ftyp(heic|heix|hevc|hevx|mif1|msf1)$/.test(brand)) return { mime: "image/heic", ext: "heic" };
  return null;
}

/** Что можно загружать: картинки к вопросам — для браузера; решения — ещё фото с iPhone и PDF. */
const ALLOWED: Record<FileKind, string[]> = {
  question: ["image/jpeg", "image/png", "image/webp"],
  submission: ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"],
};

export const ALLOWED_HINT: Record<FileKind, string> = {
  question: "JPG, PNG или WebP",
  submission: "JPG, PNG, HEIC (фото с iPhone) или PDF",
};

export async function saveUpload(input: { data: Buffer; name: string; kind: FileKind; ownerId: string }) {
  if (input.data.length > MAX_FILE_SIZE) throw new UploadError("Файл больше 15 МБ.");
  const type = detect(input.data);
  if (!type || !ALLOWED[input.kind].includes(type.mime)) {
    throw new UploadError(`Неподходящий формат. Можно: ${ALLOWED_HINT[input.kind]}.`);
  }
  const id = randomUUID();
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, `${id}.${type.ext}`), input.data);
  const name = input.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 200) || `файл.${type.ext}`;
  await db.insert(schema.file).values({
    id,
    ownerId: input.ownerId,
    kind: input.kind,
    name,
    mime: type.mime,
    size: input.data.length,
  });
  return { id, name, mime: type.mime, size: input.data.length };
}

export async function readStored(f: { id: string; mime: string }) {
  const ext = f.mime === "application/pdf" ? "pdf" : f.mime.split("/")[1].replace("jpeg", "jpg");
  return readFile(path.join(UPLOAD_DIR, `${f.id}.${ext}`));
}

export class UploadError extends Error {}
