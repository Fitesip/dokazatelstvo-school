"use client";

import { useEffect } from "react";
import { YM_ID, getYm, ymGoal } from "@/lib/metrika";

let clicksBound = false;

/** Счётчик Яндекс Метрики. Подключён только на публичных страницах, не в кабинете и админке. */
export function Metrika() {
  useEffect(() => {
    if (!YM_ID) return;
    const ym = getYm();
    if (ym) {
      // переход между страницами сайта без перезагрузки
      ym(YM_ID, "hit", window.location.href);
    } else {
      const w = window as unknown as { ym: { (...a: unknown[]): void; a?: unknown[]; l?: number } };
      // очередь вызовов до загрузки tag.js — как в официальном коде счётчика
      w.ym = Object.assign(
        function () {
          // eslint-disable-next-line prefer-rest-params
          (w.ym.a ??= []).push(arguments);
        },
        { l: Date.now() },
      );
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://mc.yandex.ru/metrika/tag.js";
      document.head.append(script);
      w.ym(YM_ID, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    }
    if (clicksBound) return;
    clicksBound = true;
    document.addEventListener("click", (e) => {
      const href = (e.target as Element).closest?.("a")?.getAttribute("href") ?? "";
      if (href.endsWith("#trial")) ymGoal("cta_trial");
      if (href.endsWith("#subjects")) ymGoal("cta_subjects");
    });
  }, []);
  return null;
}
