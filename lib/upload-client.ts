"use client";

export interface Uploaded {
  id: string;
  name: string;
  mime: string;
  size: number;
}

/** Загружает один файл через /api/upload. Ошибку возвращает текстом для показа пользователю. */
export async function uploadFile(file: File, kind: "question" | "submission"): Promise<Uploaded | { error: string }> {
  if (file.size > 15 * 1024 * 1024) return { error: "файл больше 15 МБ" };
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`/api/upload?kind=${kind}`, { method: "POST", body }).catch(() => null);
  if (!res) return { error: "нет связи с сервером" };
  const json = await res.json().catch(() => ({}));
  return res.ok ? (json as Uploaded) : { error: json.error ?? "не удалось загрузить" };
}
