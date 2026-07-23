---
id: kakaya-raznica-mezhdu-action-i-actions
title: "Разница между Action и Actions"
sidebar_position: 10
tags: ["AQA — Selenium"]
---

# Какая разница между Action и Actions?

**Коротко:** `Actions` — это класс-билдер, с помощью которого описывается цепочка низкоуровневых действий пользователя (движения мыши, клики, нажатия клавиш), а `Action` — это интерфейс, представляющий уже скомпилированную, готовую к выполнению последовательность таких действий, которую возвращает метод `Actions.build()`.

## Развёрнутый ответ

В Selenium для эмуляции сложных пользовательских взаимодействий (drag-and-drop, hover, комбинации клавиш, множественные клики) используется механизм **Advanced User Interactions API**, реализованный через два связанных типа:

- **`Actions`** (класс, `org.openqa.selenium.interactions.Actions`) — это builder-паттерн: у него есть методы вроде `.moveToElement()`, `.click()`, `.keyDown()`, `.dragAndDrop()`, каждый из которых добавляет шаг в накапливаемую последовательность действий и возвращает `this` (сам объект `Actions`) для цепочки вызовов (fluent API).
- **`Action`** (интерфейс, `org.openqa.selenium.interactions.Action`) — представляет собой уже собранную, неизменяемую последовательность действий с единственным методом `perform()`. Объект `Action` получают вызовом `.build()` у `Actions` после того, как вся цепочка шагов описана.

Практическая связь между ними:

```java
Actions actions = new Actions(driver);          // создаём builder
Action composedAction = actions                 // описываем цепочку шагов
        .moveToElement(menuElement)
        .click(submenuItem)
        .build();                                // получаем Action (готовую последовательность)

composedAction.perform();                        // выполняем
```

На практике большинство разработчиков используют сокращённый вызов, минуя явное создание переменной типа `Action`, потому что `.perform()` можно вызвать сразу на объекте `Actions` без промежуточного `.build()`:

```java
new Actions(driver)
        .moveToElement(menuElement)
        .click(submenuItem)
        .perform();
```

В большинстве современных туториалов и в реальном коде используется именно этот укороченный вариант, поэтому явное использование интерфейса `Action` встречается редко — чаще всего тогда, когда нужно **заранее собрать несколько последовательностей действий и переиспользовать их** (например, сохранить `Action` в переменную и вызвать `perform()` несколько раз в разных местах теста), либо когда `Action` передаётся как параметр в другой метод.

Ключевое отличие с точки зрения архитектуры: `Actions` — это mutable builder, накапливающий шаги через цепочку вызовов, а `Action` — это immutable результат сборки, инкапсулирующий финальную последовательность и не позволяющий её изменить после создания.

## Пример / когда применяется

Drag-and-drop с использованием `Actions`:

```java
WebElement source = driver.findElement(By.id("draggable"));
WebElement target = driver.findElement(By.id("droppable"));

new Actions(driver)
        .clickAndHold(source)
        .moveToElement(target)
        .release()
        .perform();
```

Переиспользование готового `Action` в нескольких местах теста:

```java
Action hoverOverMenu = new Actions(driver)
        .moveToElement(driver.findElement(By.id("mainMenu")))
        .build();

hoverOverMenu.perform(); // первый вызов, например перед проверкой видимости подменю
// ... другие шаги теста ...
hoverOverMenu.perform(); // повторный вызов той же последовательности действий
```

Комбинация клавиш через `Actions` (например, Ctrl+C):

```java
new Actions(driver)
        .keyDown(Keys.CONTROL)
        .sendKeys("c")
        .keyUp(Keys.CONTROL)
        .perform();
```

## На что смотрит интервьюер

- Понимает ли кандидат, что `Actions` — builder, а `Action` — результат сборки (интерфейс с методом `perform()`), а не два взаимозаменяемых названия одного и того же.
- Может ли объяснить, зачем в принципе может понадобиться явный `Action` (переиспользование одной и той же последовательности несколько раз).
- Знает ли практические примеры использования Advanced User Interactions API — drag-and-drop, hover, комбинации клавиш через `keyDown`/`keyUp`.
- Красный флаг: если кандидат утверждает, что это "просто два одинаковых способа написать одно и то же" без понимания паттерна builder — показывает поверхностное знание API, полученное только из копирования готовых сниппетов кода без понимания их структуры.
