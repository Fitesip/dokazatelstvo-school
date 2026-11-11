import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { FactList, SitePage } from "@/components/SitePage";

export const metadata: Metadata = {
  title: "Подготовка к олимпиадам по математике | Доказательство",
  description: "Подготовка к олимпиадам по математике. Оставьте телефон — сообщим о наборе.",
};

export default function OlympiadsPage() {
  return (
    <SitePage
      eyebrow="Олимпиады"
      title="Подготовка к олимпиадам по математике"
      intro="Олимпиадная математика требует не только знаний, но и умения искать решение там, где готового алгоритма нет. Сейчас мы готовим программу подготовки."
    >
      <div className="grid gap-10 md:grid-cols-2">
        <FactList
          title="Зачем участвовать"
          items={[
            "Победители и призёры перечневых олимпиад могут получить льготы при поступлении — условия устанавливает каждый вуз",
            "Сложные задачи развивают математическое мышление и помогают на профильном ЕГЭ",
          ]}
        />
        <FactList
          title="Опыт преподавателя"
          items={[
            "11 лет подготовки школьников по математике",
            "Ученики представляли Россию на международном уровне по математике",
          ]}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="glow-blue text-[24px] font-bold text-blue">Сообщим о наборе</h2>
        <LeadForm
          kind="olympiad"
          label="Оставьте телефон — расскажем о программе, когда откроем запись"
          submit="Оставить заявку"
          success="Спасибо! Сообщим, когда откроем запись на олимпиадную подготовку."
        />
      </section>
    </SitePage>
  );
}
