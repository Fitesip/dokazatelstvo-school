# Доказательство

Сайт онлайн-школы подготовки к ЕГЭ и ОГЭ: лендинг, покупка номеров и наборов,
личный кабинет ученика, админка преподавателя.
Next.js (App Router) + TypeScript + Tailwind CSS 4, PostgreSQL (Drizzle ORM), Better Auth.

## Разработка

```bash
npm install
cp .env.example .env     # заполнить BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:reset         # локальная база + демо-каталог
npm run teacher:create -- teacher@example.com "Имя Фамилия" пароль
npm run dev
```

Локально база — PGlite (PostgreSQL внутри Node, файлы в `.data/`), Docker не нужен.
Пока SMTP не настроен, письма печатаются в консоль `npm run dev`.

| Команда | Что делает |
| --- | --- |
| `npm run db:generate` | SQL-миграция из изменений `lib/db/schema.ts` |
| `npm run db:migrate` | применить миграции |
| `npm run db:seed` | демо-номера и наборы |
| `npm run db:reset` | пересоздать локальную базу с нуля |
| `npm run teacher:create` | создать преподавателя (публичной регистрации нет) |

PGlite открывается только одним процессом: команды `db:*` и `teacher:create` запускайте,
когда `npm run dev` остановлен (Ctrl+C). Если dev-сервер был убит «жёстко» и база
перестала открываться — `npm run db:reset`.

Полезные адреса: `/dev/shop` — демо-витрина (при `DEMO_SHOP=1`), `/cabinet` — кабинет,
`/admin` — админка.

Развёртывание на сервере — [DEPLOY.md](DEPLOY.md).

## Версии

Версия — это git-тег с датой.

| Тег | Что значит |
| --- | --- |
| `20261020-1`, `20261020-2`, … | сборка: N-й коммит за 20.10.2026 |
| `20261020` | релиз от 20.10.2026 |

- Тег сборки ставится автоматически после каждого коммита в `main` (хук `.githooks/post-commit`).
  Хук включается командой `npm install` (скрипт `prepare`).
- Релиз ставится вручную на текущий коммит:

  ```bash
  npm run release              # релиз с сегодняшней датой
  npm run release -- 20261020  # релиз с указанной датой
  ```

- Теги уходят на GitHub вместе с коммитами при обычном `git push`
  (`prepare` включает `push.followTags`).
