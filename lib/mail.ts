import "server-only";
import nodemailer from "nodemailer";

interface Mail {
  to: string;
  subject: string;
  /** простой текст; ссылки пишутся как есть */
  text: string;
}

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    })
  : null;

/**
 * Отправка письма. Пока нет домена и SMTP — письмо печатается в консоль
 * сервера, чтобы можно было пройти регистрацию и сброс пароля руками.
 */
export async function sendMail({ to, subject, text }: Mail) {
  if (!transport) {
    console.log(`\n✉️  [письмо не отправлено — SMTP не настроен]\nКому: ${to}\nТема: ${subject}\n\n${text}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || "Доказательство <no-reply@localhost>",
    to,
    subject,
    text,
  });
}
