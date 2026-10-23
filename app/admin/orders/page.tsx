import { desc, eq } from "drizzle-orm";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td, fmtDate, rub } from "@/components/cabinet/Table";
import { db, schema } from "@/lib/db";

const STATUS = {
  pending: { label: "ждёт оплаты", cls: "text-text/60" },
  paid: { label: "оплачен", cls: "font-bold text-green" },
  failed: { label: "не прошёл", cls: "text-accent" },
} as const;

export default async function OrdersPage() {
  const { order, orderItem, user } = schema;
  const rows = await db
    .select({ order, buyer: user.email })
    .from(order)
    .leftJoin(user, eq(user.id, order.userId))
    .orderBy(desc(order.createdAt))
    .limit(500);
  const items = await db.select().from(orderItem);
  const byOrder = new Map<string, string[]>();
  for (const i of items) byOrder.set(i.orderId, [...(byOrder.get(i.orderId) ?? []), i.title]);

  const paid = rows.filter((r) => r.order.status === "paid");
  const revenue = paid.reduce((s, r) => s + r.order.amount, 0);

  return (
    <>
      <PageTitle subtitle={`Оплачено: ${paid.length} на ${rub(revenue)}. Пока оплата через страницу-заглушку.`}>
        Заказы
      </PageTitle>
      <Table head={["Создан", "Состав", "Сумма", "Статус", "Покупатель"]} empty={rows.length ? undefined : "Заказов пока нет."}>
        {rows.map(({ order: o, buyer }) => (
          <tr key={o.id}>
            <Td className="whitespace-nowrap">{fmtDate(o.createdAt)}</Td>
            <Td>{(byOrder.get(o.id) ?? []).join(", ")}</Td>
            <Td className="whitespace-nowrap">{rub(o.amount)}</Td>
            <Td className={STATUS[o.status].cls}>{STATUS[o.status].label}</Td>
            <Td>
              {buyer ?? o.email ?? "—"}
              {o.status === "paid" && !o.userId && <div className="text-[12px] text-gold">ещё не зарегистрировался</div>}
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
