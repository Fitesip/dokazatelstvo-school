import { notFound } from "next/navigation";
import { OutlineButton } from "@/components/Button";
import { AuthCard } from "@/components/ui/AuthCard";
import { isEnrolled } from "@/lib/courses";
import { getLesson } from "@/lib/lessons";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Урок — Доказательство", robots: { index: false } };

/** Страница видеозвонка. Пока заглушка — позже здесь будет встроенный звонок. */
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser(`/lesson/${id}`);
  const l = await getLesson(id);
  if (!l) notFound();
  if (user.role !== "teacher" && !(await isEnrolled(user.id, l.lesson.productId))) notFound();

  const back = user.role === "teacher" ? "/admin/courses" : "/cabinet";

  if (l.lesson.endedAt) {
    return (
      <AuthCard title="Урок завершён" subtitle={l.title}>
        <OutlineButton href={back}>Вернуться</OutlineButton>
      </AuthCard>
    );
  }

  return (
    <AuthCard wide title={`Урок: ${l.title}`} subtitle="Групповой видеозвонок">
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[3px] border border-card-line bg-ink text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="text-accent">
          <rect x="2.5" y="6" width="13" height="12" rx="2" />
          <path d="m15.5 10.5 6-3.5v10l-6-3.5" strokeLinejoin="round" />
        </svg>
        <p className="max-w-[360px] px-4 text-[15px] text-text/80">
          Здесь будет видеозвонок. Пока это заглушка — сервис звонков подключим позже.
        </p>
      </div>
      <OutlineButton href={back}>Вернуться</OutlineButton>
    </AuthCard>
  );
}
