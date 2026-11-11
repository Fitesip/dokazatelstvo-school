import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { SitePage } from "@/components/SitePage";
import { Mascot } from "@/components/ui/Mascot";

export const metadata: Metadata = {
  title: "Учебник — лист ожидания | Доказательство",
  description: "Учебник школы «Доказательство» готовится к выходу. Оставьте телефон — сообщим первыми.",
};

export default function TextbookPage() {
  return (
    <SitePage
      eyebrow="Учебник"
      title="Учебник школы «Доказательство»"
      intro="Учебник готовится к выходу. Структуру, сроки и условия предзаказа сообщим тем, кто запишется в лист ожидания."
    >
      <section className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex min-w-0 flex-1 basis-[320px] flex-col gap-4">
          <h2 className="glow-blue text-[24px] font-bold text-blue">Лист ожидания</h2>
          <LeadForm
            kind="textbook"
            label="Оставьте телефон — сообщим, когда откроется предзаказ"
            submit="Записаться"
            success="Спасибо! Сообщим, когда откроется предзаказ учебника."
          />
        </div>
        <Mascot name="principles" width={120} className="w-[120px]" />
      </section>
    </SitePage>
  );
}
