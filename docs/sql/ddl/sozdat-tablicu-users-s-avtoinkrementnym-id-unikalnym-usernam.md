---
id: sozdat-tablicu-users-s-avtoinkrementnym-id-unikalnym-usernam
title: "Создание таблицы Users с ограничениями"
sidebar_position: 1
tags: ["Проектирование и модификация структуры (DDL)"]
---

# Создать таблицу Users с автоинкрементным id, уникальным username, email и created_at по умолчанию.

**Коротко:** нужно использовать оператор `CREATE TABLE`, где id объявляется как первичный ключ с автоинкрементом (`SERIAL`/`AUTO_INCREMENT`/`IDENTITY` в зависимости от СУБД), для username и email задаётся ограничение `UNIQUE`, а для created_at — тип `TIMESTAMP` со значением по умолчанию `CURRENT_TIMESTAMP`.

## Развёрнутый ответ

Оператор `CREATE TABLE` определяет структуру таблицы: имена колонок, их типы данных и ограничения целостности (constraints). В данном случае требуется реализовать четыре требования:

1. **Автоинкрементный id** — первичный ключ, значение которого генерируется автоматически при вставке новой строки. Реализация зависит от СУБД:
   - PostgreSQL: тип `SERIAL` (или `GENERATED ALWAYS AS IDENTITY` в современном стандарте SQL);
   - MySQL: `INT AUTO_INCREMENT`;
   - SQL Server: `INT IDENTITY(1,1)`.
2. **Уникальный username** — ограничение `UNIQUE`, которое гарантирует отсутствие дублей значений в колонке на уровне СУБД (создаётся уникальный индекс).
3. **email** — обычно также делают уникальным и обязательным (`NOT NULL`), так как это часто ключ для логина/связи с пользователем.
4. **created_at по умолчанию** — колонка типа `TIMESTAMP` (или `DATETIME`) с ограничением `DEFAULT CURRENT_TIMESTAMP`, чтобы значение проставлялось автоматически при вставке, если явно не указано.

Важные нюансы:
- Первичный ключ (`PRIMARY KEY`) неявно включает `NOT NULL` и `UNIQUE`.
- Ограничение `UNIQUE` разрешает одно значение `NULL` (в большинстве СУБД), поэтому если email обязателен — нужно явно добавить `NOT NULL`.
- В PostgreSQL начиная с 10-й версии рекомендуется `GENERATED ALWAYS AS IDENTITY` вместо `SERIAL`, так как это соответствует стандарту SQL и лучше работает с правами доступа к последовательности.
- Название ограничений (`CONSTRAINT ... UNIQUE`) стоит задавать явно в продакшен-коде для удобства последующего управления (изменение/удаление).

## Пример / когда применяется

Такая таблица — типовая основа для системы аутентификации пользователей (регистрация, логин).

```sql
-- Вариант для PostgreSQL
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

```sql
-- Вариант для MySQL
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## На что смотрит интервьюер

- Знает ли кандидат, что синтаксис автоинкремента различается между СУБД (SERIAL/AUTO_INCREMENT/IDENTITY), и не путает ли диалекты.
- Указывает ли `NOT NULL` там, где это логично (не полагается только на `UNIQUE`).
- Помнит ли про `DEFAULT CURRENT_TIMESTAMP` для created_at, а не оставляет колонку без значения по умолчанию.
- Частая ошибка — забыть, что `PRIMARY KEY` уже подразумевает уникальность и `NOT NULL`, и дублировать эти ограничения избыточно.
- Follow-up: как добавить это ограничение позже через `ALTER TABLE`, чем `UNIQUE` отличается от уникального индекса, что произойдёт при попытке вставить дублирующийся username.
