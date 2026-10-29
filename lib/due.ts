/** Сроки ДЗ: хранятся моментом времени, показываются по Москве. */

const TZ = "Europe/Moscow";

/** «23 октября» или «23 октября, 18:00». */
export function formatDue(dueAt: Date, hasTime: boolean) {
  const day = dueAt.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });
  return hasTime ? `${day}, ${dueTime(dueAt)}` : day;
}

/** YYYY-MM-DD по Москве — для календаря и <input type="date">. */
export const dueDate = (dueAt: Date) => dueAt.toLocaleDateString("sv-SE", { timeZone: TZ });

/** HH:MM по Москве. */
export const dueTime = (dueAt: Date) =>
  dueAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

/** Дата и (необязательное) время из формы → момент. Без времени — конец дня. */
export function parseDue(date: string, time: string) {
  if (!date) return null;
  const hm = /^\d{2}:\d{2}$/.test(time) ? time : "23:59";
  return new Date(`${date}T${hm}:00+03:00`);
}
