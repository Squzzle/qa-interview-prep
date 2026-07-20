---
id: chto-takoe-pattern-abstraktnaya-fabrika-abstract-factory
title: "Паттерн Абстрактная фабрика Abstract Factory"
sidebar_position: 4
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Абстрактная фабрика (Abstract Factory)?

**Коротко:** Abstract Factory — порождающий паттерн, который предоставляет интерфейс для создания семейств взаимосвязанных объектов без указания их конкретных классов, гарантируя, что созданные объекты будут совместимы друг с другом.

## Развёрнутый ответ

В отличие от Factory Method, который создаёт один продукт через один метод и наследование, Abstract Factory работает через композицию: определяется интерфейс фабрики с несколькими методами, каждый из которых создаёт свой тип продукта, а конкретные реализации фабрики гарантируют, что все продукты, созданные одной фабрикой, принадлежат одному "семейству" и совместимы между собой.

Участники паттерна: `AbstractFactory` (интерфейс с методами создания каждого продукта семейства), `ConcreteFactory` (реализация под конкретное семейство), `AbstractProduct` (интерфейс продукта каждого вида) и `ConcreteProduct` (конкретная реализация продукта в рамках семейства). Клиентский код работает только с абстрактными интерфейсами фабрики и продуктов, поэтому смена семейства продуктов сводится к подмене одной конкретной фабрики.

Классический пример вне тестирования — UI-тулкиты: `WindowsFactory` создаёт `WindowsButton` и `WindowsCheckbox`, `MacFactory` создаёт `MacButton` и `MacCheckbox`, и нельзя случайно смешать `WindowsButton` с `MacCheckbox`, потому что клиент всегда получает продукты от одной и той же конкретной фабрики.

В автоматизации тестирования Abstract Factory удобен, когда нужно создавать наборы связанных объектов под разные окружения — например, набор "драйвер + локаторы + конфигурация" под web-версию и под mobile-версию приложения, обеспечивая, что не будет случайно использован веб-локатор с мобильным драйвером.

## Пример / когда применяется

```ts
// Абстрактные продукты
interface Button {
  click(): void;
}
interface InputField {
  type(text: string): void;
}

// Семейство 1: Web
class WebButton implements Button {
  click(): void {
    console.log('Клик по веб-кнопке через Selenium');
  }
}
class WebInputField implements InputField {
  type(text: string): void {
    console.log(`Ввод "${text}" в веб-поле`);
  }
}

// Семейство 2: Mobile
class MobileButton implements Button {
  click(): void {
    console.log('Тап по мобильной кнопке через Appium');
  }
}
class MobileInputField implements InputField {
  type(text: string): void {
    console.log(`Ввод "${text}" в мобильное поле`);
  }
}

// Абстрактная фабрика
interface UiElementFactory {
  createButton(): Button;
  createInputField(): InputField;
}

// Конкретные фабрики гарантируют совместимость продуктов одного семейства
class WebElementFactory implements UiElementFactory {
  createButton(): Button {
    return new WebButton();
  }
  createInputField(): InputField {
    return new WebInputField();
  }
}

class MobileElementFactory implements UiElementFactory {
  createButton(): Button {
    return new MobileButton();
  }
  createInputField(): InputField {
    return new MobileInputField();
  }
}

function fillLoginForm(factory: UiElementFactory): void {
  const input = factory.createInputField();
  const button = factory.createButton();
  input.type('user@example.com');
  button.click();
}

fillLoginForm(new WebElementFactory());
```

## На что смотрит интервьюер

Ключевой вопрос — чётко объяснить разницу между Factory Method и Abstract Factory: один продукт через наследование vs семейство продуктов через композицию. Интервьюер может попросить нарисовать/описать UML или назвать все четыре роли паттерна. Частая ошибка кандидатов — назвать Abstract Factory "просто фабрикой фабрик" без понимания идеи совместимых семейств продуктов. Хороший сигнал — привести пример из фреймворка автотестов с набором связанных объектов под разные платформы.
