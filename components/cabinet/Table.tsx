/** Простая таблица админки: горизонтальная прокрутка на телефоне, тонкие разделители. */
export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-card-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <thead className="bg-ink text-[12px] uppercase tracking-wide text-text/60">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-card-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-6 text-center text-text/50">{empty}</p>}
    </div>
  );
}

export const Td = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 align-top text-text ${className}`}>{children}</td>
);

export const fmtDate = (d: Date) =>
  d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow", // сервер в Docker живёт в UTC
  });

export const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
