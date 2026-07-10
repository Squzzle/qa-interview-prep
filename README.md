# QA Interview Prep

Сайт-тренажёр для подготовки к собеседованиям по тестированию (QA), 2025–2026.
Структурированный каталог вопросов с исчерпывающими ответами (одна страница —
один вопрос) и интерактивный тест для самопроверки.

Источник вопросов: [статья на Habr](https://habr.com/ru/articles/1007736/).

## Что внутри

- **572 вопроса-ответа** (одна страница на вопрос) в 4 разделах:
  - Manual QA — теория (377, 18 блоков)
  - Automation QA (143, 12 блоков)
  - Лайвкодинг SQL (33, 6 блоков)
  - HR и вопросы интервьюеру (19, 2 блока)
- **Тест** (`/test`): 20 случайных вопросов из базы на **297 вопросов**
  (5 вариантов, правильных от 1 до 5). При неверном/неполном ответе — ссылка на
  страницу разбора темы.
- **Docker** (multi-stage: сборка Docusaurus → отдача через nginx).
- **Helm-chart** для деплоя в Kubernetes (minikube).

## Стек

TypeScript · Docusaurus 3 · React · Vitest · Docker (node:22-alpine → nginx:alpine) · Helm · minikube

## Локальная разработка

```bash
npm install
npm start          # дев-сервер на http://localhost:3000
npm run build      # прод-сборка в build/ (onBrokenLinks: throw)
npm run serve      # локально отдать собранную статику
```

## Тесты и валидация

```bash
npm test                          # юнит-тесты логики теста (Vitest)
node scripts/validate-quiz.mjs    # проверка тестовой базы (5 вариантов, 1-5 верных, id, topicUrl)
```

## Docker

```bash
docker build -t interview-question:local .
docker run --rm -p 8080:80 interview-question:local   # http://localhost:8080
```

## Деплой в minikube (namespace interview-question)

> Важно: не собирайте образ внутри Docker-демона minikube (`minikube docker-env`) —
> тяжёлая сборка 500+ страниц перегружает control-plane. Собирайте на хосте и
> загружайте образ в кластер через `minikube image load`.

```bash
# 1. Собрать образ на хосте
docker build -t interview-question:local .

# 2. Загрузить образ в minikube (при повторной загрузке сначала удалите старый:
#    eval "$(minikube docker-env)" && docker rmi -f interview-question:local; eval "$(minikube docker-env -u)")
minikube image load interview-question:local

# 3. Создать namespace и задеплоить чарт
kubectl create namespace interview-question --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install interview-question ./helm/interview-question -n interview-question
kubectl -n interview-question rollout status deploy/interview-question

# 4. Открыть через port-forward
kubectl -n interview-question port-forward svc/interview-question 8080:80
# → http://localhost:8080
```

## Структура

```
docs/                      # контент: 1 вопрос = 1 страница (.md), сгруппировано по разделам/блокам
src/
  components/Quiz/         # компонент теста + чистая логика оценки (grading.ts) + загрузчик базы
  pages/{index,test}.tsx   # лендинг и страница «Пройти тест»
data/
  quiz/*.json              # тестовая база (по разделам)
  inventory/*.json         # инвентарь вопросов (промежуточный артефакт)
scripts/                   # build-inventory, prep-generation, sanitize-mdx, merge-quiz, validate-quiz
Dockerfile, nginx.conf     # образ и конфиг nginx (SPA-safe try_files + реальный 404)
helm/interview-question/   # Helm-chart (Deployment + ClusterIP Service)
```

## Регенерация контента

```bash
node scripts/build-inventory.mjs    # блоки инвентаря → посекционный инвентарь со слагами
node scripts/prep-generation.mjs    # _category_.json + чанки для генерации страниц
node scripts/merge-quiz.mjs         # блочные quiz-файлы → посекционная база
node scripts/sanitize-mdx.mjs       # экранирование MDX-опасных символов в прозе
```
