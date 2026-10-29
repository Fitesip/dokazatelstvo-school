"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

export type EventColor = "accent" | "blue" | "green" | "gold";

export interface CalEvent {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM; без времени — «Весь день» */
  time?: string;
  title: string;
  subtitle?: string;
  color: EventColor;
}

const BAR: Record<EventColor, string> = {
  accent: "bg-accent",
  blue: "bg-blue",
  green: "bg-green",
  gold: "bg-gold",
};

const WEEKDAYS = ["П", "В", "С", "Ч", "П", "С", "В"];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const monthName = (d: Date) =>
  d.toLocaleDateString("ru-RU", { month: "long" }).replace(/^./, (c) => c.toUpperCase());
const dayTitle = (d: Date) =>
  d
    .toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })
    .replace(".", "")
    .toUpperCase();

/**
 * Календарь кабинета: слева сетка месяца (сегодня выделено, дни с событиями
 * подчёркнуты), справа — события выбранного дня и следующего.
 */
export function Calendar({ events }: { events: CalEvent[] }) {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    for (const list of m.values()) list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    return m;
  }, [events]);

  // сетка с понедельника; пустые клетки до 1-го числа
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const next = addDays(selected, 1);
  const isToday = keyOf(selected) === keyOf(today);
  // выбранный день и следующий — всегда; дальше — ближайшие дни, в которых что-то есть
  const upcoming: Date[] = [];
  for (let i = 2; i <= 60 && upcoming.length < 8; i++) {
    const d = addDays(selected, i);
    if (byDay.has(keyOf(d))) upcoming.push(d);
  }
  const sections = [
    { label: isToday ? `Сегодня · ${dayTitle(selected)}` : dayTitle(selected), date: selected, extra: false },
    { label: isToday ? "Завтра" : dayTitle(next), date: next, extra: false },
    ...upcoming.map((d) => ({ label: dayTitle(d), date: d, extra: true })),
  ];

  // Дополнительные дни показываем, только пока они целиком помещаются по высоте
  // (на широком экране панель не выше сетки месяца; на телефоне — максимум 3 дня).
  const panelRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(upcoming.length);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      const extras = Array.from(panel.querySelectorAll<HTMLElement>("[data-extra]"));
      if (!wide) return setFit(Math.min(3, extras.length));
      const limit = panel.clientHeight;
      setFit(extras.filter((el) => el.offsetTop + el.offsetHeight <= limit).length);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => ro.disconnect();
  }, [selected, events]);

  const shiftMonth = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="grid gap-6 rounded-[3px] border border-card-line bg-ink/60 p-5 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:gap-8 md:p-6">
      {/* сетка месяца */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold uppercase tracking-wide text-text">
            {monthName(month)} <span className="text-text/50">{month.getFullYear()}</span>
          </h3>
          <div className="flex gap-1">
            <MonthButton label="Предыдущий месяц" onClick={() => shiftMonth(-1)}>‹</MonthButton>
            <MonthButton label="Следующий месяц" onClick={() => shiftMonth(1)}>›</MonthButton>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="pb-1 text-[12px] text-text/50">
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const k = keyOf(d);
            const dayEvents = byDay.get(k);
            const isT = k === keyOf(today);
            const isSel = k === keyOf(selected);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(d)}
                aria-label={`${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}${dayEvents ? `, событий: ${dayEvents.length}` : ""}`}
                aria-pressed={isSel}
                className={`relative mx-auto flex size-10 cursor-pointer flex-col items-center justify-center rounded-[8px] text-[15px] transition ${
                  isT ? "bg-text font-bold text-ink" : "text-text hover:bg-white/5"
                } ${isSel && !isT ? "ring-1 ring-accent" : ""}`}
              >
                {d.getDate()}
                {dayEvents && (
                  <span
                    aria-hidden
                    className={`absolute bottom-1 h-[2px] w-4 rounded-full ${isT ? "bg-ink" : BAR[dayEvents[0].color]}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* события */}
      <div className="relative md:border-l md:border-card-line md:pl-8">
        <div ref={panelRef} className="flex flex-col gap-6 md:absolute md:inset-0 md:left-8 md:overflow-hidden">
          {sections.map(({ label, date, extra }, i) => {
            const list = byDay.get(keyOf(date)) ?? [];
            // не поместившиеся дни: на телефоне убираем совсем, на компьютере — прячем (их всё равно обрезает край)
            const hidden = extra && i - 2 >= fit;
            return (
              <section
                key={label}
                data-extra={extra || undefined}
                aria-hidden={hidden || undefined}
                className={`flex flex-col gap-3 ${hidden ? "max-md:hidden md:invisible" : ""}`}
              >
                <h4 className="text-[15px] font-bold uppercase tracking-wide text-text/60">{label}</h4>
                {list.length === 0 ? (
                  <p className="text-[15px] font-bold text-text/30">Нет событий</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {list.map((e, j) => (
                      <li key={j} className="flex items-stretch gap-3">
                        <span className="w-[76px] shrink-0 pt-0.5 text-[14px] text-text/80">{e.time ?? "Весь день"}</span>
                        <span aria-hidden className={`w-1 shrink-0 rounded-full ${BAR[e.color]}`} />
                        <span className="flex min-w-0 flex-col">
                          <span className="text-[16px] font-bold text-text">{e.title}</span>
                          {e.subtitle && <span className="truncate text-[13px] text-text/60">{e.subtitle}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 cursor-pointer items-center justify-center rounded-[3px] border border-card-line text-[18px] text-text transition hover:border-blue"
    >
      {children}
    </button>
  );
}
