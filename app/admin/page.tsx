import { desc } from "drizzle-orm";
import { toggleLeadAction } from "@/app/actions/admin";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td, fmtDate } from "@/components/cabinet/Table";
import { db, schema } from "@/lib/db";

export default async function LeadsPage() {
  const leads = await db.select().from(schema.lead).orderBy(desc(schema.lead.createdAt)).limit(500);
  const fresh = leads.filter((l) => l.status === "new").length;

  return (
    <>
      <PageTitle subtitle={`Новых: ${fresh}. Заявки с формы «Пробный урок» на главной.`}>Заявки</PageTitle>
      <Table head={["Когда", "Телефон", "Статус", ""]} empty={leads.length ? undefined : "Заявок пока нет."}>
        {leads.map((l) => (
          <tr key={l.id} className={l.status === "done" ? "opacity-50" : ""}>
            <Td className="whitespace-nowrap">{fmtDate(l.createdAt)}</Td>
            <Td>
              <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="font-bold text-blue">
                {l.phone}
              </a>
              {l.name && <div className="text-text/60">{l.name}</div>}
            </Td>
            <Td>{l.status === "new" ? <span className="font-bold text-accent">новая</span> : "обработана"}</Td>
            <Td className="text-right">
              <form action={toggleLeadAction}>
                <input type="hidden" name="id" value={l.id} />
                <input type="hidden" name="done" value={l.status === "new" ? "1" : "0"} />
                <button type="submit" className="cursor-pointer whitespace-nowrap text-blue underline-offset-4 hover:underline">
                  {l.status === "new" ? "Обработана" : "Вернуть в новые"}
                </button>
              </form>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
