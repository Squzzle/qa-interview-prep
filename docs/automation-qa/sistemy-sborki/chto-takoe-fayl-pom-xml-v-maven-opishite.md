---
id: chto-takoe-fayl-pom-xml-v-maven-opishite
title: "Структура файла pom.xml"
sidebar_position: 2
tags: ["Системы сборки"]
---

# Что такое файл `pom.xml` в Maven? Опишите его структуру (groupId, artifactId, version, dependencies, plugins).

**Коротко:** `pom.xml` (Project Object Model) — это главный конфигурационный XML-файл Maven-проекта, описывающий идентификацию проекта, его зависимости, плагины и параметры сборки.

## Развёрнутый ответ

`pom.xml` находится в корне проекта и является декларативным описанием того, как проект должен собираться. Maven читает этот файл и на его основе выполняет все действия — от скачивания зависимостей до сборки артефакта.

Основные элементы структуры:

- **groupId** — уникальный идентификатор организации или группы проектов, обычно в виде обратного доменного имени, например `com.company.qa`.
- **artifactId** — имя конкретного проекта/модуля, например `autotests-api`.
- **version** — версия проекта; часто используется суффикс `-SNAPSHOT` для версий в разработке.
- **packaging** — тип артефакта на выходе: `jar`, `war`, `pom` (для родительских/агрегирующих модулей).
- **dependencies** — список внешних библиотек, необходимых проекту. Каждая зависимость описывается своими groupId, artifactId, version и опционально scope (`compile`, `test`, `provided`, `runtime`).
- **build/plugins** — плагины, расширяющие поведение Maven: компиляция под нужную версию Java (`maven-compiler-plugin`), запуск unit-тестов (`maven-surefire-plugin`), запуск интеграционных тестов (`maven-failsafe-plugin`), сборка jar с зависимостями (`maven-shade-plugin` / `maven-assembly-plugin`), генерация отчётов Allure.
- **properties** — произвольные переменные, например версия Java или версии библиотек, вынесенные для переиспользования.
- **profiles** — наборы настроек, активируемые по условию (окружение, параметр командной строки), позволяющие менять зависимости или конфигурацию плагинов без изменения основного pom.
- **parent** — ссылка на родительский pom, от которого проект наследует общие настройки (актуально для мультимодульных проектов).

Комбинация groupId, artifactId и version однозначно идентифицирует артефакт в репозитории Maven (локальном `.m2` или удалённом Nexus/Artifactory) — это называется координатами Maven (GAV).

## Пример / когда применяется

Минимальный `pom.xml` для проекта автотестов:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.company.qa</groupId>
    <artifactId>autotests-api</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.rest-assured</groupId>
            <artifactId>rest-assured</artifactId>
            <version>5.3.0</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>7.8.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.1.2</version>
            </plugin>
        </plugins>
    </build>
</project>
```

## На что смотрит интервьюер

Проверяется, знает ли кандидат назначение каждого ключевого тега и разницу между scope зависимостей (`test` vs `compile` vs `provided`). Часто спрашивают про разницу между dependency и plugin, а также про то, зачем нужен `-SNAPSHOT`. Красный флаг — если кандидат не может объяснить, что такое GAV-координаты, или путает pom.xml с build.gradle без понимания различий подходов (декларативный XML vs императивный DSL).
