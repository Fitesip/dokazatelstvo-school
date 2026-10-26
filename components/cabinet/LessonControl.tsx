import Link from "next/link";
import { endLessonAction, startLessonAction } from "@/app/actions/admin";

/** «Начать урок / Завершить» для преподавателя. */
export function LessonControl({ productId, liveId }: { productId: string; liveId: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {liveId ? (
        <>
          <span className="flex items-center gap-2 text-[14px] font-bold text-accent">
            <span aria-hidden className="size-2 rounded-full bg-accent" /> идёт урок
          </span>
          <Link href={`/lesson/${liveId}`} className="text-[14px] text-blue underline-offset-4 hover:underline">
            Открыть звонок
          </Link>
          <form action={endLessonAction}>
            <input type="hidden" name="productId" value={productId} />
            <button
              type="submit"
              className="cursor-pointer rounded-[3px] border border-card-line px-3 py-1.5 text-[14px] font-bold text-text transition hover:border-accent"
            >
              Завершить урок
            </button>
          </form>
        </>
      ) : (
        <form action={startLessonAction}>
          <input type="hidden" name="productId" value={productId} />
          <button
            type="submit"
            className="cursor-pointer rounded-[3px] bg-accent px-3 py-1.5 text-[14px] font-bold text-ink drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)] transition hover:brightness-110"
          >
            Начать урок
          </button>
        </form>
      )}
    </div>
  );
}
