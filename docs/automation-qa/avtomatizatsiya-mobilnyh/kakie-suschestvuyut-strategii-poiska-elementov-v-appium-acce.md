---
id: kakie-suschestvuyut-strategii-poiska-elementov-v-appium-acce
title: "Стратегии поиска элементов в Appium"
sidebar_position: 4
tags: ["Автоматизация мобильных приложений"]
---

# Какие существуют стратегии поиска элементов в Appium (Accessibility ID, XPath, Android UIAutomator, iOS Predicate)?

**Коротко:** Appium поддерживает несколько стратегий локации элементов — Accessibility ID, ID/resource-id, class name, XPath, а также платформо-специфичные Android UiAutomator и iOS Predicate/Class Chain — и выбор стратегии напрямую влияет на скорость и стабильность тестов.

## Развёрнутый ответ

Основные стратегии поиска элементов:

- **Accessibility ID** (`~selector`) — кроссплатформенная стратегия, использующая атрибут доступности (`content-desc` на Android, `accessibilityIdentifier` на iOS). Рекомендуется как приоритетная, так как быстрая и стабильная, а также стимулирует разработчиков делать приложение доступным.

- **ID** — поиск по `resource-id` (Android) или `id`/`name` (iOS). Быстрый и надёжный способ, если у разработчиков проставлены уникальные идентификаторы.

- **Class Name** — поиск по имени класса компонента (например, `android.widget.Button` или `XCUIElementTypeButton`). Обычно возвращает много совпадений, поэтому используется в комбинации с индексом или другими условиями.

- **XPath** — универсальная, но самая медленная и хрупкая стратегия, так как требует обхода всего DOM/дерева элементов и завязана на структуру иерархии, которая может измениться при любом рефакторинге верстки.

- **Android UIAutomator (`-android uiautomator`)** — использует нативный Java-класс `UiSelector`, позволяет строить сложные селекторы с цепочками условий (`text`, `resourceId`, `className`, `instance`, `childSelector` и т.д.), выполняется на устройстве, поэтому работает быстрее XPath.

- **iOS Predicate String / Class Chain (`-ios predicate string`, `-ios class chain`)** — нативные для iOS стратегии на основе NSPredicate и XCTest, позволяют фильтровать элементы по атрибутам (`label`, `value`, `type`, `visible`) с производительностью, близкой к нативной.

- **Image** — поиск по совпадению изображения на экране (используется редко, для нестандартных случаев, например Canvas/игровых элементов).

Выбор стратегии обычно приоритизируется в порядке: Accessibility ID / ID → нативные платформенные селекторы (UIAutomator/Predicate) → XPath как последний вариант при отсутствии других атрибутов.

## Пример / когда применяется

Сравнение локатора одной и той же кнопки "Логин" разными стратегиями:

```text
Accessibility ID:      ~login_button
Android UIAutomator:   new UiSelector().resourceId("com.example:id/login_button")
iOS Predicate:         type == 'XCUIElementTypeButton' AND name == 'login_button'
XPath:                 //android.widget.Button[@resource-id="com.example:id/login_button"]
```

Android UIAutomator предпочтительнее XPath, когда нужно найти элемент по частичному совпадению текста или через сложную цепочку родитель-потомок, например:

```text
new UiScrollable(new UiSelector().scrollable(true))
    .scrollIntoView(new UiSelector().text("Настройки"));
```

## На что смотрит интервьюер

Ожидается, что кандидат объяснит, почему XPath — наименее предпочтительный вариант (производительность и хрупкость), и приведёт аргументы в пользу Accessibility ID как лучшей практики. Часто спрашивают про синтаксис UiSelector/NSPredicate наизусть и про то, как работать с динамическими списками (RecyclerView/UITableView), где обычный статичный локатор не подходит и нужен scroll-поиск или instance-based селектор.
