import { STATS } from "@/lib/data";

export function StatsRow() {
  return (
    <div className="flex w-full max-w-[480px] items-stretch border-t border-line pt-5">
      {STATS.map((stat, i) => {
        const isLast = i === STATS.length - 1;
        return (
          <div
            key={stat.value}
            className={`flex flex-col justify-center ${
              isLast ? "" : "pr-5"
            }`}
          >
            <div
              className={`flex flex-1 flex-col gap-[1.25px] ${
                isLast ? "" : "border-r border-line pr-5"
              }`}
            >
              <div className="glow-blue text-2xl font-bold text-blue">
                {stat.value}
              </div>
              <div className="pb-[0.75px] text-[12.5px] leading-[17.5px] text-text">
                {stat.label.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
