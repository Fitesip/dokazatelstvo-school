# Развёртывание на сервере

Ubuntu 22.04 с Docker и Docker Compose. Всё запускается одной командой: сайт, PostgreSQL,
Caddy (HTTPS) и ежедневные бэкапы базы.

## Первый запуск

```bash
git clone https://github.com/Fitesip/dokazatelstvo-school.git
cd dokazatelstvo-school
cp .env.production.example .env
nano .env        # заполнить: BETTER_AUTH_URL, BETTER_AUTH_SECRET, POSTGRES_PASSWORD
docker compose up -d --build
```

Секреты удобно сгенерировать так: `openssl rand -base64 32`.

Проверка: `docker compose ps` — все сервисы `running`/`healthy`, сайт открывается по
`http://<IP-сервера>`. Миграции базы применяются автоматически при старте сайта.

### Аккаунт преподавателя и демо-каталог

Публичной регистрации нет, преподаватель создаётся командой:

```bash
docker compose run --rm tools npm run teacher:create -- teacher@почта.ru "Имя Фамилия" 'надёжный-пароль'
docker compose run --rm tools npm run db:seed      # демо-номера и наборы (можно менять в админке)
```

Админка — `/admin` (вход через `/login`).

## Когда появится домен

1. В DNS домена A-запись `@` (и `www`, если нужно) → IP сервера. Порты 80 и 443 должны быть открыты.
2. В `.env`: `SITE_ADDRESS=домен.ru` и `BETTER_AUTH_URL=https://домен.ru`.
3. `docker compose up -d` — Caddy сам получит сертификат Let's Encrypt и будет его продлевать.

Почта на домене: заполнить `SMTP_*` и `MAIL_FROM` в `.env`, затем `docker compose up -d app`.
Пока SMTP пуст, письма (подтверждение почты, сброс пароля, ссылка после оплаты) видны в логах:
`docker compose logs -f app`.

## Обновление

```bash
git pull
docker compose up -d --build
```

## Бэкапы

Сервис `backup` раз в сутки кладёт в `./backups` дамп базы `db-ГГГГММДД-ЧЧММ.sql.gz` и архив загруженных
файлов (картинки к вопросам, решения учеников) `uploads-ГГГГММДД-ЧЧММ.tar.gz`, удаляя всё старше 14 дней. Копируйте папку `backups` на другой диск/сервер — бэкап на том же диске не спасёт от его поломки.

Восстановление из дампа:

```bash
docker compose stop app
gunzip -c backups/db-20261021-0300.sql.gz | docker compose exec -T db psql -U app -d app
docker compose start app
```

Загруженные файлы:

```bash
docker compose run --rm -v "$PWD/backups:/backups" --entrypoint sh app \
  -c "tar -xzf /backups/uploads-20261021-0300.tar.gz -C /app/uploads"
```

Восстанавливать базу нужно в пустую; если в ней уже есть данные — сначала
`docker compose exec db psql -U app -d app -c "drop schema public cascade; create schema public; drop schema if exists drizzle cascade;"`.

## Переезд на другой хостинг

Перенести папку проекта с `.env` и свежий дамп из `backups`, на новом сервере: `docker compose up -d --build`,
затем восстановить дамп (см. выше) и поменять A-запись домена на новый IP.
