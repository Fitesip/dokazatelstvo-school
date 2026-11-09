/** Откуда пришла заявка — общее для формы, сервера и админки. */
export const LEAD_KINDS = {
  trial: "Пробный урок",
  olympiad: "Олимпиады",
  textbook: "Учебник",
  contact: "Контакты",
} as const;

export type LeadKind = keyof typeof LEAD_KINDS;
