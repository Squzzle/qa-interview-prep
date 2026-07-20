---
id: chto-takoe-pattern-nablyudatel-observer
title: "Паттерн Наблюдатель Observer"
sidebar_position: 19
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Наблюдатель (Observer)?

**Коротко:** Observer — поведенческий паттерн "издатель-подписчик" (publisher-subscriber), при котором объект-субъект уведомляет список зависимых наблюдателей об изменении своего состояния, не зная о них ничего, кроме общего интерфейса.

## Развёрнутый ответ

Паттерн решает задачу оповещения множества объектов об изменении состояния одного объекта без жёсткой связи между ними. Субъект (Subject/Observable) хранит список наблюдателей (Observer) и предоставляет методы `subscribe`/`unsubscribe`/`notify`. При изменении состояния субъект вызывает `notify()`, который проходит по всем подписчикам и вызывает у каждого метод `update()`.

Участники:

- **Subject (Observable)** — хранит состояние и список наблюдателей; методы подписки/отписки и уведомления.
- **Observer** — интерфейс с методом `update()`, который вызывается субъектом.
- **ConcreteObserver** — конкретная реализация реакции на изменение.

Две модели push/pull:
- **Push** — субъект сам передаёт данные об изменении в `update(data)`.
- **Pull** — субъект уведомляет без данных, а наблюдатель сам запрашивает нужные данные через геттеры субъекта.

Плюсы:
- Слабая связанность — субъект не знает конкретных классов наблюдателей.
- Динамическая подписка/отписка в рантайме.
- Реализует принцип открытости/закрытости (OCP) — можно добавлять новых наблюдателей без изменения субъекта.

Минусы:
- Риск утечек памяти, если забыть отписаться (особенно в UI/фронтенде).
- Порядок уведомления наблюдателей не гарантирован, если не оговорён явно.
- При каскадных обновлениях (наблюдатель сам меняет состояние, вызывая новые уведомления) можно получить неожиданные циклы.

Observer лежит в основе множества технологий: EventEmitter в Node.js, DOM events, RxJS (Observable/Subscriber), Redux (subscribe к стору), паттерн MVC (View подписывается на Model).

## Пример / когда применяется

В автоматизации тестирования Observer применяется в репортерах: раннер тестов (субъект) уведомляет подписанные репортеры (консольный, Allure, Slack-нотификатор) о событиях жизненного цикла теста, не зная об их реализации.

```ts
interface TestObserver {
  update(event: string, testName: string): void;
}

class TestRunner {
  private observers: TestObserver[] = [];

  subscribe(observer: TestObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: TestObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  private notify(event: string, testName: string): void {
    for (const observer of this.observers) {
      observer.update(event, testName);
    }
  }

  runTest(testName: string): void {
    this.notify("started", testName);
    // ... выполнение теста ...
    this.notify("passed", testName);
  }
}

class ConsoleReporter implements TestObserver {
  update(event: string, testName: string): void {
    console.log(`[console] ${testName}: ${event}`);
  }
}

class AllureReporter implements TestObserver {
  update(event: string, testName: string): void {
    console.log(`[allure] запись события ${event} для ${testName}`);
  }
}

const runner = new TestRunner();
runner.subscribe(new ConsoleReporter());
runner.subscribe(new AllureReporter());
runner.runTest("login_should_succeed_with_valid_credentials");
```

## На что смотрит интервьюер

- Понимание разницы push/pull моделей уведомления.
- Знание проблемы утечек памяти при отсутствии отписки — частый вопрос про "memory leak в observer".
- Отличие Observer от паттерна Publish/Subscribe (Pub/Sub): в классическом Observer субъект и наблюдатели знают друг о друге напрямую, а в Pub/Sub между ними есть брокер сообщений (message broker/event bus), что даёт ещё большую развязку.
- Follow-up: "Какие реальные технологии реализуют Observer?" — ожидаются примеры (EventEmitter, RxJS, DOM addEventListener).
- Красный флаг: если кандидат не может объяснить, чем Observer отличается от Mediator (в Observer — подписка одного источника многими получателями, в Mediator — координация многих равноправных объектов через посредника).
