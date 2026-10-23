import { Calendar, type CalEvent } from "@/components/cabinet/Calendar";
import { PageTitle } from "@/components/cabinet/Shell";
import { FormNote } from "@/components/ui/Field";
import { getEnrollments } from "@/lib/orders";
import { requireUser } from "@/lib/session";

/** Пример расписания, пока нет настоящих занятий и ДЗ (этап 4). */
function demoEvents(): CalEvent[] {
  const now = new Date();
  const day = (n: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return [
    { date: day(0), time: "18:00", title: "Занятие: №14", subtitle: "Стереометрия, разбор ДЗ", color: "accent" },
    { date: day(1), title: "Дедлайн ДЗ: №13", subtitle: "Тест + развёрнутое решение", color: "gold" },
    { date: day(1), time: "17:30", title: "Занятие: №13", subtitle: "Тригонометрические уравнения", color: "accent" },
    { date: day(3), time: "18:00", title: "Пробник", subtitle: "Вариант 14, часть 1", color: "blue" },
    { date: day(6), time: "16:00", title: "Занятие: №15", subtitle: "Неравенства", color: "accent" },
    { date: day(9), title: "Разбор пробника", subtitle: "Комментарии по ошибкам", color: "green" },
  ];
}

export default async function CabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; paid?: string }>;
}) {
  const { user } = await requireUser("/cabinet");
  const { welcome, paid } = await searchParams;
  const items = await getEnrollments(user.id);

  return (
    <>
      <PageTitle subtitle="Расписание, домашние задания и прогресс — здесь.">
        Здравствуйте, {user.name.split(" ")[0]}!
      </PageTitle>

      {welcome && <FormNote>Аккаунт создан, покупка добавлена. Добро пожаловать!</FormNote>}
      {paid && !welcome && <FormNote>Оплата прошла — новые номера уже в списке ниже.</FormNote>}
      {!user.emailVerified && (
        <FormNote>Подтвердите e-mail: ссылка в письме от «Доказательство». Это нужно для восстановления пароля.</FormNote>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Календарь</h2>
        <Calendar events={demoEvents()} />
        <p className="text-[12px] text-text/50">Пока показан пример расписания — настоящие занятия появятся позже.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[19px] font-bold text-text">Мои номера</h2>
        {items.length === 0 ? (
          <p className="text-[15px] text-text/60">Пока ничего не куплено.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <li key={p.id} className="glow-line-red flex flex-col gap-1 py-2 pl-5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-accent">{p.exam}</span>
                <span className="glow-blue text-[18px] font-bold text-blue">{p.title}</span>
                <span className="text-[13px] text-text/60">
                  доступ с {p.since.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
