import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ---------- Аккаунты (таблицы Better Auth) ---------- */

export type Role = "student" | "teacher";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  role: text("role").$type<Role>().notNull().default("student"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(true),
    failedVerificationCount: integer("failed_verification_count").default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (t) => [
    index("two_factor_secret_idx").on(t.secret),
    index("two_factor_user_idx").on(t.userId),
  ],
);

/* ---------- Каталог: номера экзамена и наборы ---------- */

export type ProductKind = "task" | "bundle";
export type ExamType = "ЕГЭ" | "ОГЭ";

/** Товар: отдельный номер экзамена («task») или набор номеров со скидкой («bundle»). */
export const product = pgTable("product", {
  id: text("id").primaryKey(), // человекочитаемый slug: ege-14, ege-13-16
  kind: text("kind").$type<ProductKind>().notNull(),
  exam: text("exam").$type<ExamType>().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  /** цена в рублях (целое число) */
  price: integer("price").notNull(),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Состав набора: какие номера входят в bundle. */
export const bundleItem = pgTable(
  "bundle_item",
  {
    bundleId: text("bundle_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.bundleId, t.productId] })],
);

/* ---------- Заказы и доступы ---------- */

export type OrderStatus = "pending" | "paid" | "failed";

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    /** сумма в рублях на момент заказа */
    amount: integer("amount").notNull(),
    /** e-mail покупателя — для чека и ссылки на регистрацию */
    email: text("email"),
    /** покупатель; пусто, пока заказ не привязан к аккаунту */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    /** sha256 одноразового кода «зарегистрироваться / войти» после оплаты */
    claimTokenHash: text("claim_token_hash"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    /** stub — страница-заглушка; позже ЮKassa/Robokassa */
    provider: text("provider").notNull().default("stub"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    uniqueIndex("order_claim_idx")
      .on(t.claimTokenHash)
      .where(sql`${t.claimTokenHash} is not null`),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    price: integer("price").notNull(),
  },
  (t) => [primaryKey({ columns: [t.orderId, t.productId] })],
);

/** Доступ ученика к номеру. Набор раскрывается в отдельные номера. */
export const enrollment = pgTable(
  "enrollment",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
    orderId: text("order_id").references(() => order.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

/* ---------- Заявки с сайта ---------- */

export type LeadStatus = "new" | "done";

export const lead = pgTable(
  "lead",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull().default("trial"),
    phone: text("phone").notNull(),
    name: text("name"),
    note: text("note"),
    status: text("status").$type<LeadStatus>().notNull().default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("lead_created_idx").on(t.createdAt)],
);
