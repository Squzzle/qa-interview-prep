---
id: nazovite-posledovatelnost-vypolneniya-ci-cd-processa-na-proe
title: "Последовательность этапов CI/CD"
sidebar_position: 16
tags: ["Теория"]
---

# Назовите последовательность выполнения CI/CD процесса на проекте.

**Коротко:** Типичный CI/CD-процесс включает последовательность: коммит кода → сборка → статический анализ → автотесты (unit → API → UI) → упаковка артефакта → развёртывание на тестовое окружение → smoke/регрессионное тестирование → развёртывание на staging → развёртывание в production (вручную или автоматически).

## Развёрнутый ответ

CI/CD (Continuous Integration / Continuous Delivery/Deployment) — это практика частой автоматизированной интеграции, тестирования и доставки кода. Процесс обычно делится на два логических блока:

**Continuous Integration (CI)** — этапы, происходящие при каждом коммите/pull request:

1. **Trigger** — разработчик пушит код в ветку или открывает pull request, что запускает pipeline (через webhook в Jenkins/GitLab CI/GitHub Actions/TeamCity).
2. **Checkout** — система CI получает актуальный код из репозитория.
3. **Build** — сборка проекта (компиляция, установка зависимостей — `npm install`, `mvn compile`, `docker build`).
4. **Static Code Analysis / Linting** — статический анализ кода (SonarQube, ESLint, Checkstyle) на предмет качества кода, потенциальных багов, уязвимостей.
5. **Unit-тесты** — быстрые автотесты уровня модулей/классов, запускаются первыми, так как быстрее всего дают обратную связь.
6. **Integration/API-тесты** — тестирование взаимодействия компонентов и API.
7. **Сборка артефакта** — создание финального артефакта (jar/war, Docker-образ, статическая сборка фронтенда).
8. **Публикация артефакта** — загрузка в артефакторий (Nexus, Artifactory, Docker Registry).

**Continuous Delivery/Deployment (CD)** — этапы доставки до продакшна:

9. **Deploy to Test/QA окружение** — автоматическое развёртывание собранного артефакта.
10. **Smoke-тестирование** — быстрая проверка, что приложение вообще поднялось и базовый функционал работает.
11. **Автоматизированное регрессионное/UI-тестирование** — на тестовом окружении (Selenium/Playwright/Cypress).
12. **Deploy to Staging** — развёртывание на окружение, максимально приближенное к продакшну.
13. **Приёмочное тестирование (UAT)** — при необходимости, ручное или автоматизированное подтверждение бизнес-требований.
14. **Approval gate** (для Continuous Delivery) — ручное подтверждение релиза ответственным лицом, либо автоматический переход (для Continuous Deployment).
15. **Deploy to Production** — развёртывание в боевое окружение (может использовать стратегии blue-green, canary, rolling update).
16. **Post-deploy мониторинг** — проверка метрик, логов, алертов после релиза; при проблемах — автоматический откат (rollback).

Разница между Continuous Delivery и Continuous Deployment — в последнем шаге: Delivery подразумевает ручное подтверждение выкладки в прод, Deployment — полностью автоматическую выкладку без участия человека.

## Пример / когда применяется

Пример pipeline в GitLab CI (`.gitlab-ci.yml`):

```yaml
stages:
  - build
  - test
  - package
  - deploy-staging
  - deploy-prod

build:
  stage: build
  script:
    - mvn compile

unit-tests:
  stage: test
  script:
    - mvn test

api-tests:
  stage: test
  script:
    - mvn verify -Papi-tests

package:
  stage: package
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .
    - docker push myapp:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy-staging
  script:
    - kubectl set image deployment/myapp myapp=myapp:$CI_COMMIT_SHA -n staging
  environment: staging

deploy-prod:
  stage: deploy-prod
  script:
    - kubectl set image deployment/myapp myapp=myapp:$CI_COMMIT_SHA -n production
  environment: production
  when: manual
```

Роль QA-инженера в этом процессе — написание и поддержка автотестов на каждом этапе, настройка отчётов о прохождении тестов (Allure), участие в определении quality gates (например, минимальный % покрытия, ноль критичных багов для прохождения пайплайна).

## На что смотрит интервьюер

Интервьюер проверяет, знает ли кандидат реальную последовательность этапов, а не только термины "CI" и "CD" абстрактно. Важно упомянуть pyramid тестирования (unit → integration → e2e идут именно в таком порядке по скорости выполнения), quality gates и разницу между Continuous Delivery и Continuous Deployment. Частая ошибка — путать CI и CD местами или не знать, зачем нужен smoke-тест сразу после деплоя.
