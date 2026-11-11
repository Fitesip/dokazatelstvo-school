export type AnswerColor = "red" | "green";

export interface AnswerRow {
  number: number;
  /** индекс выбранного варианта в OPTIONS */
  selected: number;
  color: AnswerColor;
}

export const OPTIONS = ["А", "Б", "В", "Г"] as const;

export const ANSWER_ROWS: AnswerRow[] = [
  { number: 1, selected: 1, color: "red" },
  { number: 2, selected: 0, color: "red" },
  { number: 3, selected: 2, color: "red" },
  { number: 4, selected: 3, color: "green" },
];

export interface Stat {
  value: string;
  label: string[];
}

export const STATS: Stat[] = [
  { value: "+30", label: ["баллов в среднем по", "итогам курса"] },
  { value: "78%", label: ["учеников улучшили", "результат пробников"] },
  { value: "11 лет", label: ["опыта подготовки к", "экзаменам"] },
];

/* ---------- Навигация ---------- */

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Записаться на пробный урок →", href: "/#trial" },
  { label: "Олимпиады", href: "/olympiads" },
  { label: "Учебник", href: "/textbook" },
  { label: "Преподаватель", href: "/teacher" },
  { label: "Контакты", href: "/contacts" },
];

export const PHONE = { label: "+7 (000) 000‑00‑00", href: "tel:+70000000000" };

/* ---------- Принципы ---------- */

export type PrincipleIcon = "plus" | "square" | "pulse" | "circle";

export interface Principle {
  icon: PrincipleIcon;
  title: string;
  text: string;
}

export const PRINCIPLES: Principle[] = [
  {
    icon: "plus",
    title: "Методическая база",
    text: "Программа выстроена по кодификатору ФИПИ, а не по интуиции преподавателя.",
  },
  {
    icon: "square",
    title: "Реальные варианты ЕГЭ",
    text: "Тренируемся на заданиях прошлых лет и актуальных демоверсиях, а не на абстрактных примерах.",
  },
  {
    icon: "pulse",
    title: "Разбор типичных ошибок",
    text: "Каждое домашнее задание возвращается с комментарием: что не так и как исправить.",
  },
  {
    icon: "circle",
    title: "Обратная связь по ДЗ",
    text: "Ученик и родитель всегда видят прогресс — без сюрпризов ближе к экзамену.",
  },
];

/* ---------- Предметы ---------- */

export type ExamType = "ЕГЭ" | "ОГЭ";

export interface Subject {
  exam: ExamType;
  format: "Группа" | "Инд.";
  title: string;
  description: string;
  price: string;
  unit: "/мес" | "/занятие";
  href: string;
}

const SUBJECT_DESCRIPTION =
  "Полный курс по кодификатору с еженедельными пробниками.";

export const SUBJECTS: Subject[] = [
  {
    exam: "ЕГЭ",
    format: "Группа",
    title: "Математика (профиль)",
    description: SUBJECT_DESCRIPTION,
    price: "4 200 ₽",
    unit: "/мес",
    href: "#",
  },
  {
    exam: "ЕГЭ",
    format: "Группа",
    title: "Математика (1-9 задания)",
    description: SUBJECT_DESCRIPTION,
    price: "3 900 ₽",
    unit: "/мес",
    href: "#",
  },
  {
    exam: "ЕГЭ",
    format: "Инд.",
    title: "Математика (2 часть)",
    description: SUBJECT_DESCRIPTION,
    price: "1 800 ₽",
    unit: "/занятие",
    href: "#",
  },
  {
    exam: "ОГЭ",
    format: "Группа",
    title: "Математика (1-5 задания)",
    description: SUBJECT_DESCRIPTION,
    price: "3 400 ₽",
    unit: "/мес",
    href: "#",
  },
  {
    exam: "ОГЭ",
    format: "Группа",
    title: "Математика (5-9 задания)",
    description: SUBJECT_DESCRIPTION,
    price: "3 600 ₽",
    unit: "/мес",
    href: "#",
  },
  {
    exam: "ЕГЭ",
    format: "Инд.",
    title: "Математика (1 часть)",
    description: SUBJECT_DESCRIPTION,
    price: "1 900 ₽",
    unit: "/занятие",
    href: "#",
  },
];

/* ---------- Результаты ---------- */

export interface ResultStat {
  value: string;
  lines: string[];
}

export const RESULTS: ResultStat[] = [
  { value: "+30", lines: ["баллов в среднем прибавляют", "ученики к концу курса"] },
  {
    value: "78%",
    lines: ["учеников показывают рост", "результата уже на первом пробнике"],
  },
  {
    value: "240+",
    lines: ["учеников прошли курс подготовки", "за последние два года"],
  },
];

/* ---------- Как проходит обучение ---------- */

export interface Step {
  number: string;
  title: string;
  text: string;
}

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Диагностика",
    text: "Пробный тест показывает текущий уровень и слабые темы — с него начинается индивидуальный план.",
  },
  {
    number: "02",
    title: "Индивидуальный план",
    text: "Составляем программу под цель по баллам и оставшееся время до экзамена.",
  },
  {
    number: "03",
    title: "Занятия и домашние задания",
    text: "Регулярные уроки с проверкой ДЗ и комментариями по каждой ошибке.",
  },
  {
    number: "04",
    title: "Пробники и разбор",
    text: "Реальные варианты экзамена в условиях, приближенных к настоящим.",
  },
  {
    number: "05",
    title: "Экзамен",
    text: "Ученик приходит на ЕГЭ или ОГЭ подготовленным — без пробелов и сюрпризов.",
  },
];

/* ---------- Преподаватель ---------- */

export const TEACHER = {
  quote:
    "«Математика — это красивый, логичный и точный язык, на котором я научу вас говорить».",
  name: "Алёна Александровна Соколова",
  role: "Преподаватель математики · 11 лет подготовки к ЕГЭ и ОГЭ",
  facts: [
    "Физик-ядерщик, три высших образования: КГУ, МГУ и МФТИ",
    "Действующий школьный учитель, лауреат всероссийского конкурса «Педагогический дебют»",
    "Основатель репетиторского центра с шестилетней историей",
    "Выпускники поступают на бюджет в МГУ, ВШЭ, МФТИ, МГТУ им. Баумана и другие ведущие вузы",
  ],
};

/** Страница «О преподавателе» — факты из рассказа самой преподавательницы. */
export const TEACHER_PAGE = {
  intro:
    "Физик-ядерщик и действующий школьный учитель. 11 лет готовит к ЕГЭ и ОГЭ и учит решать сложные задачи спокойно и по шагам.",
  sections: [
    {
      title: "Образование и наука",
      items: [
        "Физик-ядерщик, три высших образования: КГУ, МГУ и МФТИ",
        "В 20 лет доказала собственную математическую теорему",
      ],
    },
    {
      title: "Опыт преподавания",
      items: [
        "Действующий школьный учитель",
        "11 лет подготовки к ЕГЭ и ОГЭ",
        "Основатель репетиторского центра, который работает уже 6 лет",
      ],
    },
    {
      title: "Признание",
      items: [
        "Лауреат всероссийского конкурса «Педагогический дебют»",
        "Победитель всероссийского конкурса учительских команд",
        "Ученики представляли Россию на международном уровне по математике",
      ],
    },
    {
      title: "Куда поступают ученики",
      items: [
        "МГУ им. М. В. Ломоносова и НИУ ВШЭ",
        "Университет Иннополис и МФТИ",
        "МГТУ им. Н. Э. Баумана, МАИ и РГУ нефти и газа им. И. М. Губкина",
      ],
    },
  ],
  method: {
    title: "Методика: математическая безопасность",
    text: "На экзамене от волнения может подвести и пространственное воображение, и тригонометрическая окружность. Поэтому геометрия и тригонометрия переводятся в понятную арифметику: там, где раньше нужно было «увидеть» решение, появляется чёткая последовательность шагов.",
    items: [
      "У каждого типа задач есть надёжный алгоритм — понятно, с чего начать",
      "Каждый шаг можно проверить, поэтому описка не превращается в потерянную задачу",
      "Решения записываются по критериям экзамена, чтобы не терять баллы из-за формы",
    ],
  },
} as const;

/** Контакты для страницы «Контакты». Заполнить, когда будут настоящие телефон, почта и Telegram. */
export const CONTACT_DETAILS: NavItem[] = [];

/* ---------- Футер ---------- */

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Разделы",
    links: [
      { label: "Предметы", href: "/#subjects" },
      { label: "Олимпиады", href: "/olympiads" },
      { label: "Учебник", href: "/textbook" },
      { label: "Преподаватель", href: "/teacher" },
      { label: "Контакты", href: "/contacts" },
      { label: "Личный кабинет", href: "/cabinet" },
    ],
  },
  {
    title: "Контакты",
    links: [
      { label: PHONE.label, href: PHONE.href },
      { label: "info@example.com", href: "mailto:info@example.com" },
      { label: "Telegram", href: "https://t.me/" },
    ],
  },
  {
    title: "Документы",
    links: [
      { label: "Публичная оферта", href: "#" },
      { label: "Политика конфиденциальности", href: "#" },
    ],
  },
];
