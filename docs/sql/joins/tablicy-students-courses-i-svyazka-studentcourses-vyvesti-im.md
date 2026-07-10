---
id: tablicy-students-courses-i-svyazka-studentcourses-vyvesti-im
title: "JOIN через связующую таблицу many-to-many"
sidebar_position: 3
tags: ["JOINs (работа с несколькими таблицами)"]
---

# Таблицы Students, Courses и связка StudentCourses. Вывести имена студентов и названия курсов.

**Коротко:** классическая схема "многие ко многим" реализуется через промежуточную таблицу (junction table), и для получения плоского списка нужны два `JOIN` подряд: `Students → StudentCourses → Courses`.

## Развёрнутый ответ

Связь "многие ко многим" (один студент может учиться на нескольких курсах, на одном курсе может быть много студентов) невозможно выразить одним внешним ключом в одной из основных таблиц — для этого вводится отдельная связующая таблица, которая обычно содержит как минимум два внешних ключа: на `Students` и на `Courses` (например, `student_id` и `course_id`), а часто это и есть составной первичный ключ этой таблицы.

Чтобы получить читаемый результат (имена студентов и названия курсов, а не их числовые id), нужно дважды присоединиться:
1. `Students JOIN StudentCourses` по `Students.id = StudentCourses.student_id`;
2. результат `JOIN Courses` по `StudentCourses.course_id = Courses.id`.

Тип соединения (`INNER` или `LEFT`) выбирается в зависимости от требований:
- `INNER JOIN` вернёт только тех студентов, которые реально записаны хотя бы на один курс, и только те курсы, на которые есть хотя бы один студент;
- если нужно показать всех студентов, включая тех, кто ни на один курс не записан, первое соединение делают `LEFT JOIN`;
- аналогично для курсов без студентов нужен `LEFT JOIN` от `Courses`.

Стоит также отметить, что если у студента несколько курсов, он появится в результате несколько раз (по одной строке на пару студент-курс) — это ожидаемое поведение при работе со связкой many-to-many, а не ошибка.

## Пример / когда применяется

Схема: `Students(id, name)`, `Courses(id, course_name)`, `StudentCourses(student_id, course_id)`.

```sql
SELECT
    s.name AS student_name,
    c.course_name
FROM Students s
INNER JOIN StudentCourses sc
    ON s.id = sc.student_id
INNER JOIN Courses c
    ON sc.course_id = c.id
ORDER BY s.name, c.course_name;
```

Если требуется вывести и студентов без курсов:

```sql
SELECT
    s.name AS student_name,
    c.course_name
FROM Students s
LEFT JOIN StudentCourses sc
    ON s.id = sc.student_id
LEFT JOIN Courses c
    ON sc.course_id = c.id
ORDER BY s.name;
```

Такая схема типична не только для студентов и курсов, но и для тегов статей, ролей пользователей, товаров в заказах и любых других отношений many-to-many.

## На что смотрит интервьюер

- Понимает ли кандидат, зачем вообще нужна отдельная связующая таблица, а не прямой внешний ключ в одной из таблиц.
- Правильно ли выстроена цепочка `JOIN` — частая ошибка: пытаться связать `Students` и `Courses` напрямую, минуя `StudentCourses`.
- Понимание, что тип `JOIN` (INNER/LEFT) влияет на то, попадут ли в результат "сироты" — студенты без курсов или курсы без студентов.
- Follow-up вопросы: "как посчитать количество студентов на каждом курсе?" (нужен `GROUP BY course_name` с `COUNT`), "как найти курсы, на которые не записан ни один студент?" (`LEFT JOIN` + `WHERE sc.course_id IS NULL`).
