import Link from "next/link";
import { PageTitle } from "@/components/cabinet/Shell";
import { Table, Td, fmtDate } from "@/components/cabinet/Table";
import { FormNote } from "@/components/ui/Field";
import { pendingSubmissions } from "@/lib/homework";

export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<{ graded?: string }> }) {
  const { graded } = await searchParams;
  const list = await pendingSubmissions();

  return (
    <>
      <PageTitle subtitle={`Ждут проверки: ${list.length}. Сначала самые ранние.`}>Проверка ДЗ</PageTitle>
      {graded && <FormNote>Оценка выставлена — ученик уже видит её и правильные ответы.</FormNote>}
      <Table head={["Сдано", "Ученик", "Курс", "ДЗ", ""]} empty={list.length ? undefined : "Все работы проверены."}>
        {list.map((s) => (
          <tr key={s.id}>
            <Td className="whitespace-nowrap">{fmtDate(s.submittedAt)}</Td>
            <Td className="font-bold">{s.student}</Td>
            <Td>{s.course}</Td>
            <Td>{s.assignment}</Td>
            <Td className="text-right">
              <Link href={`/admin/review/${s.id}`} className="font-bold text-blue underline-offset-4 hover:underline">
                Проверить
              </Link>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
