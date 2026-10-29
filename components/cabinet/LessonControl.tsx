import { endLessonAction } from "@/app/actions/admin";
import { StartLessonForm } from "./StartLessonForm";

/**
 * Управление уроком у преподавателя. Звонок создаётся в своём сервисе
 * (Телемост, Zoom и т. п.), здесь — только ссылка на него для учеников.
 */
export function LessonControl({ productId, live, lastUrl }: { productId: string; live: boolean; lastUrl: string }) {
  if (!live) return <StartLessonForm productId={productId} lastUrl={lastUrl} />;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 text-[14px] font-bold text-accent">
        <span aria-hidden className="size-2 rounded-full bg-accent" /> идёт урок
      </span>
      <form action={endLessonAction}>
        <input type="hidden" name="productId" value={productId} />
        <button
          type="submit"
          className="cursor-pointer rounded-[3px] border border-card-line px-3 py-1.5 text-[14px] font-bold text-text transition hover:border-accent"
        >
          Завершить урок
        </button>
      </form>
    </div>
  );
}
