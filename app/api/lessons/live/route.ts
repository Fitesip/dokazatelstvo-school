import { NextResponse } from "next/server";
import { liveLessonsFor } from "@/lib/lessons";
import { getSession } from "@/lib/session";

/** Идущие уроки для плашки «Идёт урок» — кабинет опрашивает раз в 15 секунд. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });
  const lessons = await liveLessonsFor(session.user.id, session.user.role === "teacher");
  return NextResponse.json(lessons, { headers: { "Cache-Control": "no-store" } });
}
