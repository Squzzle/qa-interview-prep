---
id: chto-takoe-pattern-most-bridge
title: "Паттерн Мост Bridge"
sidebar_position: 8
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Мост (Bridge)?

**Коротко:** Bridge — структурный паттерн, который разделяет абстракцию и её реализацию на две независимые иерархии классов, связанные композицией, чтобы их можно было изменять и расширять независимо друг от друга.

## Развёрнутый ответ

Bridge решает проблему "взрыва иерархий классов" (class explosion), которая возникает, когда абстракцию пытаются расширять через наследование сразу по двум независимым измерениям одновременно. Классический пример: если есть иерархия "Фигура" (Круг, Квадрат) и иерархия "Цвет отрисовки" (Красный, Синий), попытка сделать всё через наследование потребует классов `RedCircle`, `BlueCircle`, `RedSquare`, `BlueSquare` — количество классов растёт как произведение вариаций. Bridge разрывает эту связь: одна иерархия (`Abstraction`) хранит ссылку на объект другой иерархии (`Implementor`) и делегирует ей часть работы через композицию, а не наследование.

Структура паттерна: `Abstraction` (определяет высокоуровневый интерфейс, хранит ссылку на `Implementor`), `RefinedAbstraction` (расширяет `Abstraction` дополнительной логикой), `Implementor` (интерфейс низкоуровневых операций), `ConcreteImplementor` (конкретная реализация низкоуровневых операций). Абстракция и реализация могут развиваться независимо: можно добавить новый `ConcreteImplementor`, не трогая иерархию `Abstraction`, и наоборот.

Bridge часто путают с Adapter из-за похожей структуры (оба используют делегирование через хранимую ссылку), но их назначение принципиально разное: Adapter применяется постфактум, чтобы "подружить" уже существующие несовместимые интерфейсы (реактивный паттерн, решает проблему совместимости), тогда как Bridge проектируется заранее, на этапе архитектуры, чтобы предотвратить разрастание иерархий и разделить абстракцию от реализации (проактивный, архитектурный паттерн).

В автоматизации тестирования Bridge применяется, когда нужно независимо комбинировать "что тестируем" (высокоуровневые действия — Page Object, бизнес-шаги) и "как тестируем" (низкоуровневый движок — Selenium, Playwright, Appium), не создавая отдельный класс Page Object под каждую комбинацию действия и движка.

## Пример / когда применяется

```ts
// Implementor — интерфейс низкоуровневого "движка" выполнения действий
interface AutomationEngine {
  click(selector: string): void;
  typeText(selector: string, text: string): void;
}

// ConcreteImplementor
class SeleniumEngine implements AutomationEngine {
  click(selector: string): void {
    console.log(`[Selenium] клик по ${selector}`);
  }
  typeText(selector: string, text: string): void {
    console.log(`[Selenium] ввод "${text}" в ${selector}`);
  }
}

class PlaywrightEngine implements AutomationEngine {
  click(selector: string): void {
    console.log(`[Playwright] клик по ${selector}`);
  }
  typeText(selector: string, text: string): void {
    console.log(`[Playwright] ввод "${text}" в ${selector}`);
  }
}

// Abstraction — высокоуровневая бизнес-логика страницы, не зависящая от движка
abstract class LoginPage {
  constructor(protected engine: AutomationEngine) {}
  abstract login(user: string, password: string): void;
}

// RefinedAbstraction
class StandardLoginPage extends LoginPage {
  login(user: string, password: string): void {
    this.engine.typeText('#username', user);
    this.engine.typeText('#password', password);
    this.engine.click('#submit');
  }
}

// Любую RefinedAbstraction можно скомбинировать с любым ConcreteImplementor
const loginOnSelenium = new StandardLoginPage(new SeleniumEngine());
const loginOnPlaywright = new StandardLoginPage(new PlaywrightEngine());

loginOnSelenium.login('qa', 'pass123');
loginOnPlaywright.login('qa', 'pass123');
```

## На что смотрит интервьюер

Главный вопрос — умеет ли кандидат чётко отличить Bridge от Adapter: оба структурно похожи (делегирование через композицию), но Bridge проектируется заранее для разделения двух независимых измерений изменения, а Adapter решает задачу постфактум — совместимость уже существующих несовместимых интерфейсов. Интервьюер может попросить объяснить проблему "взрыва иерархий классов" и показать, как Bridge её решает. Хороший практический пример — разделение Page Object (что тестируем) и движка автоматизации (как тестируем), как показано выше.
