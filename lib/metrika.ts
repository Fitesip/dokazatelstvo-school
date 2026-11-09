/** Яндекс Метрика: номер счётчика задаётся при сборке, без него код не подключается. */
export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID) || 0;

type Ym = (id: number, method: string, ...args: unknown[]) => void;

export const getYm = () => (window as unknown as { ym?: Ym }).ym;

/** Цель в Метрике: отправка формы, клик по кнопке записи. */
export function ymGoal(name: string) {
  if (YM_ID) getYm()?.(YM_ID, "reachGoal", name);
}
