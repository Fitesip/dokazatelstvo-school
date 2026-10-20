import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Подготовка к ЕГЭ и ОГЭ — системно, без лишней суеты",
  description:
    "Понятные объяснения, регулярные домашние задания, разбор ошибок. Подготовка к ЕГЭ и ОГЭ 2027.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
