import { Footer } from "./Footer";
import { Header } from "./Header";
import { Metrika } from "./Metrika";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";

/** Шапка, футер и счётчик для публичных страниц. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Metrika />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/** Внутренняя страница сайта: надпись, заголовок, вводный текст и содержимое. */
export function SitePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SiteFrame>
      <Container className="flex flex-col gap-10 py-12 lg:py-16">
        <div className="flex max-w-[760px] flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="glow-blue text-[32px] font-bold leading-[1.18] text-blue sm:text-[40px]">{title}</h1>
          {intro && <p className="text-[17px] leading-[27px] text-text">{intro}</p>}
        </div>
        {children}
      </Container>
    </SiteFrame>
  );
}

/** Смысловой блок страницы: подзаголовок и список с красными тире. */
export function FactList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="glow-line-red flex flex-col gap-4 py-1 pl-6">
      <h2 className="glow-blue text-[20px] font-bold text-blue">{title}</h2>
      <ul className="flex flex-col gap-3 text-[15px] leading-[24px] text-text">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="glow-red font-bold text-accent">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
