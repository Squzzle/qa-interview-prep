---
id: kak-vyglyadit-tipichnyy-yaml-fayl-konfiguracii-dlya-github
title: "Структура YAML-конфига CI"
sidebar_position: 6
tags: ["CI/CD"]
---

# Как выглядит типичный YAML-файл конфигурации для GitHub Actions или GitLab CI? Опишите его основные разделы (name, on, jobs, steps).

**Коротко:** Конфигурация CI описывается в YAML-файле, где указываются название пайплайна (`name`), триггеры запуска (`on`/`rules`), набор заданий (`jobs`), а внутри каждого задания — последовательность шагов (`steps`/`script`), каждый из которых выполняет команду или переиспользуемое действие.

## Развёрнутый ответ

В GitHub Actions конфигурация — это workflow-файл в директории `.github/workflows/`, формат YAML. Основные разделы:

- `name` — человекочитаемое имя workflow, отображается в UI GitHub.
- `on` — события-триггеры: `push`, `pull_request`, `schedule` (cron), `workflow_dispatch` (ручной запуск), можно ограничить конкретными ветками или путями файлов.
- `jobs` — набор именованных заданий, каждое из которых выполняется на отдельном раннере (`runs-on: ubuntu-latest` и т.п.), могут выполняться параллельно или зависеть друг от друга через `needs`.
- Внутри job — `steps`: последовательность шагов. Шаг может быть либо готовым действием (`uses: actions/checkout@v4`), либо произвольной командой (`run: npm test`).

В GitLab CI конфигурация — файл `.gitlab-ci.yml` в корне репозитория. Основные разделы аналогичны по смыслу, но называются иначе:

- `stages` — список этапов пайплайна в порядке выполнения (build, test, deploy).
- Именованные job-блоки (например, `unit_tests:`), каждый привязан к своему `stage`.
- `script` — команды, которые выполняются в job (аналог `steps`/`run` в GitHub Actions).
- `rules`/`only`/`except` — условия запуска job (по ветке, по тегу, по типу события) — аналог `on` в GitHub Actions.
- `variables` — переменные окружения, доступные во всех или конкретных job.

Общая логика в обеих системах одна: описать декларативно, "когда" запускать пайплайн, "что" за задания в нем есть и "какие шаги" выполняются внутри каждого задания. Артефакты между job передаются через ключевые слова `artifacts` (GitLab) или `actions/upload-artifact` / `actions/download-artifact` (GitHub Actions).

## Пример / когда применяется

Пример GitHub Actions workflow:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:e2e
```

Пример эквивалента в GitLab CI:

```yaml
stages:
  - test

e2e_tests:
  stage: test
  image: node:20
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  script:
    - npm ci
    - npm run test:e2e
```

## На что смотрит интервьюер

Интервьюер проверяет, что кандидат реально писал или редактировал конфиг-файлы CI, а не просто видел их. Follow-up вопросы: "Как ограничить запуск job только по определенному пути изменения файлов?", "Как передать артефакт из одного job в другой?", "Как настроить матрицу (matrix) для запуска тестов на нескольких версиях/браузерах параллельно?". Красный флаг — если кандидат не различает `on`/`jobs`/`steps` в GitHub Actions или `stages`/`script` в GitLab CI, либо путает синтаксис двух систем.
