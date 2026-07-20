---
id: chto-takoe-pattern-stroitel-builder
title: "Паттерн Строитель Builder"
sidebar_position: 5
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Строитель (Builder)?

**Коротко:** Builder — порождающий паттерн, который отделяет пошаговое конструирование сложного объекта от его представления, позволяя создавать разные вариации объекта одним и тем же процессом сборки, обычно через цепочку вызовов методов.

## Развёрнутый ответ

Builder решает проблему "телескопических конструкторов" — когда у класса много опциональных параметров и приходится создавать множество перегруженных конструкторов (`new User(name)`, `new User(name, age)`, `new User(name, age, email)` и т.д.) либо передавать длинный список аргументов, большинство из которых `undefined`/`null`. Вместо этого Builder предоставляет пошаговый интерфейс для установки каждого параметра отдельно, а в конце — метод `build()`, который возвращает готовый объект.

Классические участники паттерна: `Builder` (интерфейс с шагами построения), `ConcreteBuilder` (реализует шаги и хранит собираемый продукт), `Product` (сложный объект, который собирается) и опционально `Director` (класс, инкапсулирующий типовые последовательности вызовов builder'а для сборки известных конфигураций продукта). На практике в TypeScript/JS Director часто опускают, ограничиваясь fluent-интерфейсом (методы возвращают `this` для цепочки вызовов).

Преимущества: читаемый и явный код создания объекта, возможность валидации на этапе сборки (в `build()`), неизменяемость (immutability) итогового продукта — Builder может собирать промежуточное изменяемое состояние, а на выходе отдавать `readonly`/frozen-объект. Отличие от Factory: Factory отвечает "какой класс создать", Builder отвечает "как пошагово собрать сложный объект с множеством параметров".

В автоматизации тестирования Builder — один из самых используемых паттернов для генерации тестовых данных (test data builders): вместо создания громоздких фикстур JSON строится читаемый код, который явно показывает, какие поля важны для конкретного теста, а остальные получают разумные значения по умолчанию.

## Пример / когда применяется

```ts
interface User {
  readonly name: string;
  readonly email: string;
  readonly age?: number;
  readonly isAdmin: boolean;
}

class UserBuilder {
  private name = 'Default Name';
  private email = 'default@example.com';
  private age?: number;
  private isAdmin = false;

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.email = email;
    return this;
  }

  withAge(age: number): this {
    this.age = age;
    return this;
  }

  asAdmin(): this {
    this.isAdmin = true;
    return this;
  }

  build(): User {
    if (!this.email.includes('@')) {
      throw new Error('Некорректный email');
    }
    return {
      name: this.name,
      email: this.email,
      age: this.age,
      isAdmin: this.isAdmin,
    };
  }
}

// В тесте — явно видно, что важно для конкретного сценария
const adminUser: User = new UserBuilder()
  .withName('QA Lead')
  .withEmail('lead@company.com')
  .asAdmin()
  .build();

const regularUser: User = new UserBuilder().build();
```

## На что смотрит интервьюер

Интервьюер проверяет понимание проблемы "телескопического конструктора" и умение объяснить, чем Builder отличается от Factory Method/Abstract Factory (акцент на пошаговой сборке одного сложного объекта, а не на выборе класса). Часто спрашивают про роль Director и почему в JS/TS-мире его обычно опускают в пользу fluent-интерфейса. Плюс в ответе — упоминание применения Builder для генерации тестовых данных в автотестах, это прямое попадание в практику QA-автоматизатора.
