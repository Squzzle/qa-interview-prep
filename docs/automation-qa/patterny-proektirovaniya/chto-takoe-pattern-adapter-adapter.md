---
id: chto-takoe-pattern-adapter-adapter
title: "Паттерн Адаптер Adapter"
sidebar_position: 7
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Адаптер (Adapter)?

**Коротко:** Adapter — структурный паттерн, который преобразует интерфейс одного класса в интерфейс, ожидаемый клиентом, позволяя объектам с несовместимыми интерфейсами работать вместе без изменения их исходного кода.

## Развёрнутый ответ

Adapter выступает "переходником" между клиентским кодом, который ожидает определённый интерфейс (`Target`), и существующим классом с несовместимым интерфейсом (`Adaptee`), который нужно использовать повторно, но нельзя (или нежелательно) изменять — например, потому что это код стороннего SDK, легаси-модуль или библиотека. Adapter реализует ожидаемый клиентом интерфейс `Target` и внутри делегирует вызовы объекту `Adaptee`, преобразуя аргументы и результаты в нужный формат.

Различают два вида реализации:
- **Объектный адаптер (composition)** — Adapter хранит ссылку на экземпляр `Adaptee` и делегирует ему вызовы. Это предпочтительный вариант в TypeScript/JS, так как избегает проблем множественного наследования и более гибок (favor composition over inheritance).
- **Классовый адаптер (inheritance)** — Adapter наследуется одновременно от `Target` и `Adaptee` (возможно только в языках с множественным наследованием, например C++; в TS/Java эмулируется через реализацию интерфейса + наследование от класса).

Adapter часто путают с Facade и Decorator: Facade упрощает и объединяет сложный набор интерфейсов в один простой, не обязательно меняя сигнатуры; Decorator добавляет новое поведение объекту, сохраняя тот же интерфейс; Adapter же именно преобразует один интерфейс в другой, несовместимый, без добавления нового поведения по сути.

В автоматизации тестирования Adapter — очень частый паттерн: он используется, чтобы унифицировать работу с разными инструментами под одним общим интерфейсом в фреймворке — например, обернуть Selenium WebDriver и Playwright Page под единый интерфейс `BrowserDriver`, чтобы бизнес-логика тестов (Page Object, шаги) не зависела от конкретного инструмента автоматизации.

## Пример / когда применяется

```ts
// Target — интерфейс, который ожидает наш фреймворк автотестов
interface BrowserDriver {
  navigate(url: string): void;
  findAndClick(selector: string): void;
}

// Adaptee — сторонняя/легаси библиотека с несовместимым интерфейсом
class LegacySeleniumWrapper {
  goToUrl(url: string): void {
    console.log(`Selenium: переход на ${url}`);
  }

  clickByXPath(xpath: string): void {
    console.log(`Selenium: клик по XPath ${xpath}`);
  }
}

// Adapter — приводит интерфейс Adaptee к интерфейсу Target
class SeleniumAdapter implements BrowserDriver {
  constructor(private legacyDriver: LegacySeleniumWrapper) {}

  navigate(url: string): void {
    this.legacyDriver.goToUrl(url);
  }

  findAndClick(selector: string): void {
    // Преобразуем CSS-подобный selector в XPath, ожидаемый Adaptee
    const xpath = `//*[@id="${selector}"]`;
    this.legacyDriver.clickByXPath(xpath);
  }
}

// Клиентский код зависит только от единого интерфейса BrowserDriver
function runLoginTest(driver: BrowserDriver): void {
  driver.navigate('https://example.com/login');
  driver.findAndClick('login-button');
}

runLoginTest(new SeleniumAdapter(new LegacySeleniumWrapper()));
```

## На что смотрит интервьюер

Интервьюер обычно просит отличить Adapter от Facade и Decorator — это самая частая путаница на собеседованиях. Хороший ответ подчёркивает: Adapter меняет интерфейс под ожидания клиента (совместимость), Facade упрощает доступ к сложной подсистеме, Decorator добавляет поведение, сохраняя интерфейс. Плюс — умение объяснить разницу объектного и классового адаптера и обосновать, почему в TS/JS обычно выбирают композицию. Практический пример с унификацией Selenium/Playwright под общий интерфейс фреймворка сильно повышает доверие интервьюера.
