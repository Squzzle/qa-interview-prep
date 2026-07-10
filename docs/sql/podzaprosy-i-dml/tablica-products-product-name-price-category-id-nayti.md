---
id: tablica-products-product-name-price-category-id-nayti
title: "Продукт с максимальной ценой по категории"
sidebar_position: 2
tags: ["Подзапросы и обновление данных (Subqueries, UPDATE, DELETE)"]
---

# Таблица Products (product_name, price, category_id). Найти название продукта с максимальной ценой в каждой категории.

**Коротко:** задача решается либо через коррелированный подзапрос с сравнением `price = (SELECT MAX(price) ... WHERE category_id = ...)`, либо более эффективно через оконную функцию `RANK()`/`ROW_NUMBER()` с `PARTITION BY category_id ORDER BY price DESC`.

## Развёрнутый ответ

Классический способ — сгруппировать таблицу по `category_id`, найти максимальную цену в каждой группе, а затем соединить (`JOIN`) результат с исходной таблицей, чтобы получить `product_name`. Соединение нужно, потому что `GROUP BY` с агрегатной функцией `MAX(price)` не может одновременно вернуть `product_name`, если в группе несколько продуктов.

Второй способ — коррелированный подзапрос в `WHERE`: для каждой строки проверяется, равна ли её цена максимальной цене в её категории.

Третий, наиболее современный и обычно предпочтительный способ — оконная функция. `RANK() OVER (PARTITION BY category_id ORDER BY price DESC)` присваивает ранг 1 самой дорогой позиции внутри каждой категории, после чего достаточно отфильтровать строки с рангом 1. Оконные функции обычно эффективнее коррелированных подзапросов, так как таблица сканируется один раз.

Важные нюансы:

- Если в категории несколько товаров с одинаковой максимальной ценой, `MAX()`/`JOIN`-подход и `RANK()` вернут все такие товары (ничьи), а `ROW_NUMBER()` вернёт только один товар из ничьей (произвольно, если нет дополнительной сортировки для детерминизма).
- Нужно решить заранее с интервьюером: нужны ли все товары при ничьей или строго один — от этого зависит выбор `RANK()` vs `ROW_NUMBER()`.
- Не все СУБД (например, старые версии MySQL до 8.0) поддерживают оконные функции — тогда остаётся только вариант с подзапросом/`JOIN`.

## Пример / когда применяется

Вариант через `JOIN` с подзапросом (группировка):

```sql
SELECT p.product_name, p.price, p.category_id
FROM Products p
JOIN (
    SELECT category_id, MAX(price) AS max_price
    FROM Products
    GROUP BY category_id
) m ON p.category_id = m.category_id AND p.price = m.max_price;
```

Вариант через коррелированный подзапрос:

```sql
SELECT product_name, price, category_id
FROM Products p1
WHERE price = (
    SELECT MAX(price)
    FROM Products p2
    WHERE p2.category_id = p1.category_id
);
```

Вариант через оконную функцию (без дублей при ничьей — только один товар):

```sql
SELECT product_name, price, category_id
FROM (
    SELECT product_name, price, category_id,
           ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rn
    FROM Products
) t
WHERE rn = 1;
```

## На что смотрит интервьюер

- Понимает ли кандидат, почему нельзя просто написать `SELECT product_name, MAX(price) FROM Products GROUP BY category_id` — это не гарантирует, что `product_name` соответствует строке с максимальной ценой (в некоторых СУБД, например MySQL без `ONLY_FULL_GROUP_BY`, это вообще молча выдаст произвольный `product_name`).
- Знание оконных функций как более современной и часто более производительной альтернативы.
- Обработка ничьих (`RANK` vs `ROW_NUMBER` vs `DENSE_RANK`).
- Понимание производительности: `JOIN` с агрегатом обычно эффективнее, чем коррелированный подзапрос, который выполняется для каждой строки.
