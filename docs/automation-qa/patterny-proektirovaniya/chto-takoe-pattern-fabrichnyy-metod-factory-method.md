---
id: chto-takoe-pattern-fabrichnyy-metod-factory-method
title: "Паттерн Фабричный метод Factory Method"
sidebar_position: 3
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Фабричный метод (Factory Method)?

**Коротко:** Factory Method — порождающий паттерн, который определяет интерфейс для создания объекта, но позволяет подклассам решать, объект какого именно класса создавать, тем самым отделяя код-клиент от конкретных реализаций.

## Развёрнутый ответ

Factory Method вводит абстрактный (или базовый) метод создания объекта, который переопределяется в подклассах. Клиентский код работает с объектами через общий интерфейс/абстрактный класс продукта и никогда не знает точный конкретный класс создаваемого объекта — эта ответственность делегирована подклассам фабрики. Формально в паттерне участвуют четыре роли: `Product` (интерфейс продукта), `ConcreteProduct` (конкретная реализация продукта), `Creator` (класс с фабричным методом, который может содержать и другую бизнес-логику) и `ConcreteCreator` (переопределяет фабричный метод, чтобы возвращать конкретный продукт).

Ключевая цель — соблюдение принципа открытости/закрытости (Open/Closed Principle): чтобы добавить новый тип продукта, не нужно менять существующий клиентский код, достаточно добавить новый `ConcreteCreator`/`ConcreteProduct`. Это отличает Factory Method от простого использования оператора `new` напрямую, который жёстко привязывает код к конкретному классу.

Важно отличать Factory Method от Abstract Factory: Factory Method создаёт один тип продукта через наследование (один метод — один продукт), а Abstract Factory создаёт семейства связанных продуктов через композицию (несколько методов на одном интерфейсе фабрики). Также Factory Method иногда путают с простым статическим методом-фабрикой (static factory method / simple factory) — это упрощённая, не-GoF-паттерновая форма без полиморфизма через наследование, хотя на практике в TypeScript её используют чаще из-за простоты.

В автоматизации тестирования Factory Method активно применяется для создания драйверов под разные браузеры/платформы и для создания объектов Page Object под разные окружения (web, mobile web, разные версии UI).

## Пример / когда применяется

```ts
// Product
interface WebDriver {
  open(url: string): void;
}

// ConcreteProduct
class ChromeDriver implements WebDriver {
  open(url: string): void {
    console.log(`Chrome открывает ${url}`);
  }
}

class FirefoxDriver implements WebDriver {
  open(url: string): void {
    console.log(`Firefox открывает ${url}`);
  }
}

// Creator
abstract class DriverCreator {
  abstract createDriver(): WebDriver;

  runTest(url: string): void {
    const driver = this.createDriver();
    driver.open(url);
  }
}

// ConcreteCreator
class ChromeDriverCreator extends DriverCreator {
  createDriver(): WebDriver {
    return new ChromeDriver();
  }
}

class FirefoxDriverCreator extends DriverCreator {
  createDriver(): WebDriver {
    return new FirefoxDriver();
  }
}

// Клиентский код не знает о конкретных классах драйверов
function runSuite(creator: DriverCreator): void {
  creator.runTest('https://example.com');
}

runSuite(new ChromeDriverCreator());
runSuite(new FirefoxDriverCreator());
```

## На что смотрит интервьюер

Интервьюер часто проверяет, отличает ли кандидат Factory Method от Abstract Factory и от простого "Simple Factory" (статического метода без наследования) — это самая частая путаница. Также могут спросить, какой принцип SOLID реализует паттерн (Open/Closed) и почему прямое использование `new` в клиентском коде — плохая практика (жёсткая связанность, сложность расширения и тестирования). Хороший ответ — привести пример с созданием драйверов под разные браузеры в фреймворке автотестов, как показано выше.
