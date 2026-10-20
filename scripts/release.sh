#!/bin/sh
# Релиз: ставит на текущий коммит тег ГГГГММДД (без -N).
# Использование: npm run release            — релиз с сегодняшней датой
#                npm run release -- 20261020 — релиз с указанной датой
set -e

day=${1:-$(date +%Y%m%d)}
case "$day" in
  [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) ;;
  *) echo "Дата должна быть в формате ГГГГММДД, получено: $day" >&2; exit 1 ;;
esac

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Есть незакоммиченные изменения — сначала закоммитьте их." >&2
  exit 1
fi

if git rev-parse -q --verify "refs/tags/$day" >/dev/null; then
  echo "Релиз $day уже существует (коммит $(git rev-list -n 1 "$day" | cut -c1-7))." >&2
  exit 1
fi

git tag -a "$day" -m "Релиз $day" HEAD
echo "Релиз: $day → $(git rev-parse --short HEAD)"
echo "Отправить на GitHub: git push origin $day"
