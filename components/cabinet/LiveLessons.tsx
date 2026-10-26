"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Live {
  id: string;
  title: string;
}

/**
 * Плашка «Идёт урок — Подключиться». Появляется сама, без перезагрузки:
 * кабинет раз в 15 секунд спрашивает сервер (и сразу при возврате на вкладку).
 */
export function LiveLessons({ initial }: { initial: Live[] }) {
  const [live, setLive] = useState(initial);

  useEffect(() => {
    let stopped = false;
    const load = async () => {
      if (document.hidden) return;
      const res = await fetch("/api/lessons/live", { cache: "no-store" }).catch(() => null);
      if (res?.ok && !stopped) setLive(await res.json());
    };
    const timer = setInterval(load, 15_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  if (live.length === 0) return null;

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      {live.map((l) => (
        <div
          key={l.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-accent bg-accent/10 px-5 py-4 drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)]"
        >
          <div className="flex items-center gap-3">
            <span aria-hidden className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-3 rounded-full bg-accent" />
            </span>
            <span className="text-[16px] text-text">
              Идёт урок: <b>{l.title}</b>
            </span>
          </div>
          <Link
            href={`/lesson/${l.id}`}
            className="rounded-[3px] bg-accent px-4 py-2 text-[14px] font-bold text-ink transition hover:brightness-110"
          >
            Подключиться
          </Link>
        </div>
      ))}
    </div>
  );
}
