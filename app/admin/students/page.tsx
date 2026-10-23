import { count, desc, eq } from "drizzle-orm";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td, fmtDate } from "@/components/cabinet/Table";
import { db, schema } from "@/lib/db";

export default async function StudentsPage() {
  const { user, enrollment } = schema;
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.emailVerified,
      twoFactor: user.twoFactorEnabled,
      createdAt: user.createdAt,
      tasks: count(enrollment.productId),
    })
    .from(user)
    .leftJoin(enrollment, eq(enrollment.userId, user.id))
    .where(eq(user.role, "student"))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt));

  return (
    <>
      <PageTitle subtitle={`Всего: ${rows.length}.`}>Ученики</PageTitle>
      <Table head={["Ученик", "Номеров", "Почта", "2FA", "С нами с"]} empty={rows.length ? undefined : "Учеников пока нет."}>
        {rows.map((s) => (
          <tr key={s.id}>
            <Td>
              <div className="font-bold">{s.name}</div>
              <div className="text-text/60">{s.email}</div>
            </Td>
            <Td>{s.tasks}</Td>
            <Td>{s.verified ? "подтверждена" : <span className="text-gold">не подтверждена</span>}</Td>
            <Td>{s.twoFactor ? "вкл." : "—"}</Td>
            <Td className="whitespace-nowrap">{fmtDate(s.createdAt)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
