import { COURSES, TIERS, TIER_FEATURES, rub, type TierId } from "@/lib/data";
import { Mascot, type MascotName } from "./ui/Mascot";

/** Мангусты уровней: смотрит телевизор / говорит по телефону / уже в МГУ. */
const TIER_MASCOT: Record<TierId, MascotName> = {
  self: "tierSelf",
  support: "tierSupport",
  pro: "tierPro",
};

/** Три уровня рядом: мангуст, что входит, цены по курсам. */
export function TierCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {TIERS.map((tier) => (
        <article
          key={tier.id}
          className={`flex flex-col gap-5 rounded-[3px] border bg-ink/60 p-6 ${
            tier.id === "pro" ? "border-accent drop-shadow-[0_0_7.5px_rgb(230_57_70/0.35)]" : "border-card-line"
          }`}
        >
          <div className="flex h-[170px] items-end justify-center">
            <Mascot name={TIER_MASCOT[tier.id]} width={190} className="max-h-[170px] w-auto" />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <h3 className="glow-blue text-[22px] font-bold text-blue">{tier.title}</h3>
            <p className="text-[14px] text-text/80">{tier.tagline}</p>
          </div>

          <ul className="flex flex-col divide-y divide-card-line border-y border-card-line text-[14px]">
            {TIER_FEATURES.map((f) => {
              const v = f.values[tier.id];
              return (
                <li key={f.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="text-text/70">{f.label}</span>
                  {v ? (
                    <span className="text-right font-bold text-text">{v}</span>
                  ) : (
                    <span className="text-text/30" aria-label="не входит">
                      —
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <ul className="mt-auto flex flex-col gap-1.5 text-[14px]">
            {COURSES.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-4">
                <span className="text-text">{c.title}</span>
                <span className="whitespace-nowrap">
                  <b className="glow-blue text-blue">{rub(c.prices[tier.id])}</b>
                  <span className="text-[12px] text-text/60"> /мес</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

/** Сводная таблица «курс × уровень». */
export function PriceTable() {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-card-line">
      <table className="w-full min-w-[620px] border-collapse text-left text-[15px]">
        <caption className="sr-only">Цены за месяц по курсам и уровням</caption>
        <thead className="bg-ink text-[13px] text-text/70">
          <tr>
            <th scope="col" className="px-5 py-3 font-bold">
              Курс
            </th>
            {TIERS.map((t) => (
              <th key={t.id} scope="col" className="px-5 py-3 text-right font-bold">
                {t.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-card-line">
          {COURSES.map((c) => (
            <tr key={c.id}>
              <th scope="row" className="px-5 py-3 font-normal">
                <span className="font-bold text-text">{c.title}</span>
                <span className="block text-[12px] text-text/60">{c.subtitle}</span>
              </th>
              {TIERS.map((t) => (
                <td key={t.id} className="whitespace-nowrap px-5 py-3 text-right font-bold text-blue">
                  {rub(c.prices[t.id])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
