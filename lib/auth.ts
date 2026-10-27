import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { db, schema } from "./db";
import { sendMail } from "./mail";

export const auth = betterAuth({
  appName: "Доказательство",
  // при разработке сайт бывает и на :3000, и на :3001 — вход должен работать на обоих
  trustedOrigins:
    process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://localhost:3001"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
    },
  }),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "student", input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // регистрация открыта только из нашего кода после оплаты (см. hooks ниже)
    autoSignIn: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Сброс пароля — Доказательство",
        text: `Здравствуйте, ${user.name}!\n\nЧтобы задать новый пароль, перейдите по ссылке (действует 1 час):\n${url}\n\nЕсли вы не запрашивали сброс, просто проигнорируйте это письмо.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Подтвердите e-mail — Доказательство",
        text: `Здравствуйте, ${user.name}!\n\nПодтвердите адрес почты, перейдя по ссылке:\n${url}`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 дней
    updateAge: 60 * 60 * 24, // продлеваем раз в сутки
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  advanced: {
    // на сервере сайт стоит за Caddy — реальный IP ученика приходит в заголовке
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Публичная регистрация закрыта: аккаунт создаётся только после оплаты,
      // через серверное действие registerAfterPurchase (у него нет ctx.request).
      if (ctx.path === "/sign-up/email" && ctx.request) {
        throw new APIError("FORBIDDEN", {
          message: "Регистрация доступна только после покупки.",
        });
      }
    }),
  },
  plugins: [
    twoFactor({
      issuer: "Доказательство",
      backupCodeOptions: { amount: 8 },
    }),
    nextCookies(), // должен быть последним
  ],
});

export type Session = typeof auth.$Infer.Session;
