---
id: tablica-orders-nayti-klientov-bez-zakazov-not-exists
title: "Клиенты без заказов через NOT EXISTS"
sidebar_position: 3
tags: ["Подзапросы и обновление данных (Subqueries, UPDATE, DELETE)"]
---

# Таблица Orders. Найти клиентов без заказов (NOT EXISTS или LEFT JOIN).

**Коротко:** нужно взять таблицу клиентов (`Customers`) и найти тех, для кого в `Orders` нет ни одной связанной записи — это делается через `NOT EXISTS` с коррелированным подзапросом либо через `LEFT JOIN ... WHERE Orders.id IS NULL`.

## Развёрнутый ответ

Задача про поиск "отсутствующих" связей — классический паттерн anti-join. Есть три основных способа решения:

1. **`NOT EXISTS`** — коррелированный подзапрос проверяет для каждого клиента, существует ли хотя бы один заказ с его `customer_id`. Это самый безопасный по семантике вариант, так как `EXISTS`/`NOT EXISTS` работают по принципу "есть ли строка", не завися от `NULL`-значений внутри подзапроса.
2. **`LEFT JOIN` + `WHERE ... IS NULL`** — соединяем клиентов с заказами через `LEFT JOIN`, и для клиентов без заказов колонки из `Orders` будут `NULL`; фильтруем по `Orders.customer_id IS NULL` (или любому NOT NULL столбцу из Orders, обычно PK).
3. **`NOT IN`** — работает похоже на `NOT EXISTS`, но имеет опасную особенность: если подзапрос `SELECT customer_id FROM Orders` вернёт хотя бы одну строку с `NULL`, весь `NOT IN` перестанет возвращать какие-либо строки (из-за трёхзначной логики SQL: сравнение с `NULL` даёт `UNKNOWN`, а не `FALSE`). Поэтому `NOT IN` считается менее безопасным и его либо избегают, либо явно добавляют `WHERE customer_id IS NOT NULL` в подзапрос.

С точки зрения производительности: `NOT EXISTS` и корректно построенный `LEFT JOIN ... IS NULL` обычно оптимизируются планировщиком одинаково эффективно (особенно при наличии индекса на `Orders.customer_id`), тогда как `NOT IN` часто менее эффективен и рискован из-за `NULL`.

## Пример / когда применяется

Через `NOT EXISTS`:

```sql
SELECT c.id, c.name
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.id
);
```

Через `LEFT JOIN`:

```sql
SELECT c.id, c.name
FROM Customers c
LEFT JOIN Orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

Небезопасный вариант через `NOT IN` (нужна защита от NULL):

```sql
SELECT c.id, c.name
FROM Customers c
WHERE c.id NOT IN (
    SELECT o.customer_id
    FROM Orders o
    WHERE o.customer_id IS NOT NULL
);
```

## На что смотрит интервьюер

- Знает ли кандидат про ловушку `NOT IN` с `NULL` — это один из самых частых "гочей" на SQL-собеседованиях.
- Умеет ли объяснить разницу между `EXISTS`/`NOT EXISTS` (проверка наличия строки, не важны конкретные значения) и `IN`/`NOT IN` (сравнение значений).
- Проверяет ли кандидат, что при `LEFT JOIN` фильтрация идёт именно по колонке из правой таблицы (`Orders`), а не по колонке из `Customers` — частая ошибка новичков.
- Упоминает ли важность индекса на внешнем ключе `customer_id` для производительности anti-join на больших таблицах.
