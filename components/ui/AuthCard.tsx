import { Logo } from "./Logo";

/** Страницы входа/регистрации/оплаты: логотип и карточка по центру экрана. */
export function AuthCard({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-10 sm:py-16">
      <Logo />
      <section
        className={`flex w-full flex-col gap-6 rounded-[3px] border border-card-line bg-bg p-6 sm:p-8 ${
          wide ? "max-w-[640px]" : "max-w-[440px]"
        }`}
      >
        <div className="flex flex-col gap-2">
          <h1 className="glow-blue text-[24px] font-bold leading-tight text-blue">{title}</h1>
          {subtitle && <p className="text-[14px] leading-[22px] text-text/80">{subtitle}</p>}
        </div>
        {children}
      </section>
    </main>
  );
}
