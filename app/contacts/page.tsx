import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { SitePage } from "@/components/SitePage";
import { CONTACT_DETAILS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Контакты | Доказательство",
  description: "Связаться с онлайн-школой «Доказательство»: вопросы о подготовке к ЕГЭ по математике.",
};

export default function ContactsPage() {
  return (
    <SitePage
      eyebrow="Контакты"
      title="Свяжитесь с нами"
      intro="Напишите, в каком вы классе и что хотите узнать о подготовке — мы перезвоним."
    >
      {CONTACT_DETAILS.length > 0 && (
        <ul className="flex flex-col gap-2 text-[17px]">
          {CONTACT_DETAILS.map((c) => (
            <li key={c.href}>
              <a href={c.href} className="text-blue underline-offset-4 hover:underline">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <LeadForm
        extended
        kind="contact"
        label="Телефон"
        submit="Отправить"
        success="Спасибо! Мы получили ваше сообщение и перезвоним."
      />
    </SitePage>
  );
}
