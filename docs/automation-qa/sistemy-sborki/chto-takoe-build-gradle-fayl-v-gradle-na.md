---
id: chto-takoe-build-gradle-fayl-v-gradle-na
title: "Файл build.gradle и его язык"
sidebar_position: 6
tags: ["Системы сборки"]
---

# Что такое `build.gradle` файл в Gradle? На каком языке он пишется?

**Коротко:** `build.gradle` — это основной конфигурационный файл Gradle-проекта, описывающий зависимости, плагины и задачи сборки; пишется на Groovy DSL (`build.gradle`) или на Kotlin DSL (`build.gradle.kts`).

## Развёрнутый ответ

В отличие от Maven, где `pom.xml` — декларативный XML-файл, Gradle использует императивный подход через скриптовый DSL (Domain-Specific Language), построенный поверх языков программирования. Это даёт возможность не только декларативно описывать конфигурацию, но и писать произвольную логику (условия, циклы, кастомные задачи) прямо в файле сборки.

Существует два варианта синтаксиса:

- **Groovy DSL** — исторически первый и до сих пор широко используемый вариант, файл называется `build.gradle`. Groovy — динамически типизированный язык на JVM, синтаксис более лаконичный, но меньше поддержки автодополнения и проверки типов в IDE.
- **Kotlin DSL** — более новый вариант, файл называется `build.gradle.kts`. Kotlin — статически типизированный язык, что даёт полноценную поддержку автодополнения, рефакторинга и проверки типов на этапе редактирования в IDE (IntelliJ IDEA). Google рекомендует Kotlin DSL как основной вариант для новых Android/Java-проектов.

Типичное содержимое `build.gradle`:

- **plugins** — блок подключения плагинов (аналог plugin в Maven), например `java`, `application`, `io.qameta.allure`.
- **repositories** — откуда скачивать зависимости (`mavenCentral()`, `google()`, корпоративный репозиторий).
- **dependencies** — список зависимостей с конфигурациями (аналог scope в Maven): `implementation`, `testImplementation`, `compileOnly`, `runtimeOnly`.
- **tasks** — определение или настройка задач сборки, включая кастомные задачи, написанные прямо на языке скрипта.

Также в многомодульных проектах есть файл `settings.gradle` (или `settings.gradle.kts`), который описывает, какие модули входят в сборку (аналог `<modules>` в родительском pom.xml), и `gradle.properties` для общих свойств.

## Пример / когда применяется

Пример `build.gradle` (Groovy DSL) для тестового фреймворка:

```groovy
plugins {
    id 'java'
    id 'io.qameta.allure' version '2.11.2'
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.seleniumhq.selenium:selenium-java:4.15.0'
    testImplementation 'org.testng:testng:7.8.0'
}

test {
    useTestNG() {
        suites 'testng.xml'
    }
}
```

Эквивалент на Kotlin DSL (`build.gradle.kts`) выглядел бы аналогично, но с типизированным синтаксисом, например `implementation("org.seleniumhq.selenium:selenium-java:4.15.0")`.

## На что смотрит интервьюер

Интервьюер проверяет знание разницы между Groovy и Kotlin DSL, а также понимание, что Gradle — императивный скрипт, а не декларативный XML. Частая ошибка — не знать про существование Kotlin DSL или путать конфигурации зависимостей (`implementation` vs `api` vs `testImplementation`). Плюсом будет упоминание, что `implementation` скрывает зависимость от потребителей модуля, а `api` — пробрасывает её дальше по цепочке зависимостей (актуально для многомодульных проектов).
