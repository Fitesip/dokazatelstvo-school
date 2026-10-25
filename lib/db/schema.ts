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

/* ---------- Уроки (видеозвонок) ---------- */

/** Урок идёт, пока endedAt пустой. Ученики курса видят ссылку на звонок. */
export const lesson = pgTable(
  "lesson",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    startedBy: text("started_by").references(() => user.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [index("lesson_product_idx").on(t.productId)],
);

/* ---------- Файлы (картинки к вопросам, решения учеников) ---------- */

export type FileKind = "question" | "submission";

export const file = pgTable(
  "file",
  {
    id: text("id").primaryKey(), // имя файла на диске = id + расширение
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    kind: text("kind").$type<FileKind>().notNull(),
    name: text("name").notNull(), // исходное имя у пользователя
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("file_owner_idx").on(t.ownerId)],
);

/* ---------- Домашние задания ---------- */

export type AssignmentStatus = "draft" | "published";

export const assignment = pgTable(
  "assignment",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").$type<AssignmentStatus>().notNull().default("draft"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("assignment_product_idx").on(t.productId)],
);

export type QuestionKind = "choice" | "short" | "long";

export const question = pgTable(
  "question",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignment.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    kind: text("kind").$type<QuestionKind>().notNull(),
    text: text("text").notNull().default(""),
    /** short: допустимые ответы */
    accepted: text("accepted").array().notNull().default(sql`'{}'::text[]`),
  },
  (t) => [index("question_assignment_idx").on(t.assignmentId)],
);

export const questionOption = pgTable(
  "question_option",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    text: text("text").notNull(),
    correct: boolean("correct").notNull().default(false),
  },
  (t) => [index("option_question_idx").on(t.questionId)],
);

export const questionImage = pgTable(
  "question_image",
  {
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.fileId] })],
);

/* ---------- Сданные работы ---------- */

export type SubmissionStatus = "submitted" | "checked";

/** Одна попытка на ученика и ДЗ. */
export const submission = pgTable(
  "submission",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").$type<SubmissionStatus>().notNull().default("submitted"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    /** оценка по 5-балльной шкале */
    grade: integer("grade"),
    comment: text("comment"),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    checkedBy: text("checked_by").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    uniqueIndex("submission_once_idx").on(t.assignmentId, t.userId),
    index("submission_status_idx").on(t.status),
  ],
);

export const answer = pgTable(
  "answer",
  {
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    /** choice: id выбранных вариантов; short/long: текст */
    optionIds: text("option_ids").array().notNull().default(sql`'{}'::text[]`),
    text: text("text").notNull().default(""),
    /** результат автопроверки (для long — пусто) */
    autoCorrect: boolean("auto_correct"),
  },
  (t) => [primaryKey({ columns: [t.submissionId, t.questionId] })],
);

export const answerFile = pgTable(
  "answer_file",
  {
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.submissionId, t.fileId] })],
);
