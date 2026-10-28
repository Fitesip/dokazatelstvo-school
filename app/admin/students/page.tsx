import { avg, count, desc, eq } from "drizzle-orm";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td, fmtDate } from "@/components/cabinet/Table";
import { db, schema } from "@/lib/db";

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "оценка" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "оценки" : "оценок");

export default async function StudentsPage() {
  const { user, enrollment, submission } = schema;
  const [rows, grades] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.emailVerified,
        createdAt: user.createdAt,
        tasks: count(enrollment.productId),
      })
      .from(user)
      .leftJoin(enrollment, eq(enrollment.userId, user.id))
      .where(eq(user.role, "student"))
      .groupBy(user.id)
      .orderBy(desc(user.createdAt)),
    // средний балл — только по проверенным работам
    db
      .select({ userId: submission.userId, avg: avg(submission.grade), n: count() })
      .from(submission)
      .where(eq(submission.status, "checked"))
      .groupBy(submission.userId),
  ]);

  return (
    <>
      <PageTitle subtitle={`Всего: ${rows.length}.`}>Ученики</PageTitle>
      <Table head={["Ученик", "Номеров", "Средний балл", "Почта", "С нами с"]} empty={rows.length ? undefined : "Учеников пока нет."}>
        {rows.map((s) => {
          const g = grades.find((x) => x.userId === s.id);
          return (
            <tr key={s.id}>
              <Td>
                <div className="font-bold">{s.name}</div>
                <div className="text-text/60">{s.email}</div>
              </Td>
              <Td>{s.tasks}</Td>
              <Td>
                {g?.avg ? (
                  <>
                    <b className="glow-blue text-[17px] text-blue">{Number(g.avg).toFixed(1).replace(".", ",")}</b>
                    <span className="text-[12px] text-text/50">
                      {" "}
                      · {g.n} {plural(g.n)}
                    </span>
                  </>
                ) : (
                  <span className="text-text/40">—</span>
                )}
              </Td>
              <Td>{s.verified ? "подтверждена" : <span className="text-gold">не подтверждена</span>}</Td>
              <Td className="whitespace-nowrap">{fmtDate(s.createdAt)}</Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
