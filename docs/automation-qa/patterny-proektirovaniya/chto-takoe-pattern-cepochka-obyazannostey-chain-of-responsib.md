---
id: chto-takoe-pattern-cepochka-obyazannostey-chain-of-responsib
title: "Паттерн Цепочка обязанностей"
sidebar_position: 14
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Цепочка обязанностей (Chain of Responsibility)?

**Коротко:** Chain of Responsibility — поведенческий паттерн, который выстраивает обработчики запроса в цепочку и передаёт запрос по цепочке до тех пор, пока какой-то из обработчиков не обработает его (или запрос не пройдёт через всю цепочку), избавляя отправителя запроса от знания, кто конкретно его обработает.

## Развёрнутый ответ

Паттерн решает задачу развязки отправителя запроса от конкретного получателя, когда обработать запрос потенциально может один из нескольких объектов, и заранее неизвестно, какой именно. Каждый обработчик (`Handler`) хранит ссылку на следующий обработчик в цепочке и реализует общий интерфейс с методом обработки запроса. Получив запрос, обработчик либо обрабатывает его сам, либо (если не может/не должен) передаёт запрос дальше по цепочке следующему обработчику.

Ключевые элементы:

- **Handler** — интерфейс/абстрактный класс с методом обработки запроса и ссылкой на следующий handler (`setNext`/`next`).
- **ConcreteHandler** — конкретная реализация, которая либо обрабатывает запрос, либо передаёт его следующему звену.
- **Client** — формирует цепочку (порядок обработчиков) и отправляет запрос первому звену, не заботясь о том, кто в итоге его обработает.

Важные нюансы:

- Цепочка может как останавливаться на первом обработчике, справившемся с запросом, так и пропускать запрос через все звенья (например, при построении конвейера обработки/валидации, где каждый обработчик что-то добавляет к запросу).
- Порядок звеньев в цепочке важен и определяет итоговое поведение — этим управляет клиент (или сборщик/конфигуратор) при построении цепочки.
- Если ни один обработчик не смог обработать запрос, нужно явно предусмотреть поведение по умолчанию (иначе запрос «теряется» в конце цепочки).
- Паттерн снижает связанность между отправителем и получателями, но может усложнить отладку — путь запроса через цепочку не всегда очевиден при чтении кода.
- Часто путают с последовательностью вызовов через `if/else if` — принципиальное отличие Chain of Responsibility в том, что обработчики — это отдельные объекты, о которых клиент не обязан знать заранее, и цепочку можно менять/переконфигурировать динамически без изменения кода клиента.

## Пример / когда применяется

В автотестах паттерн часто используют для многоступенчатой валидации входных данных теста или для обработки разных типов ошибок в фреймворке (например, конвейер обработки исключений: сначала проверяем сетевую ошибку, потом ошибку таймаута, потом ошибку ассерта).

```ts
interface RequestHandler {
  setNext(handler: RequestHandler): RequestHandler;
  handle(request: TestRequest): string | null;
}

interface TestRequest {
  hasValidToken: boolean;
  environment: "dev" | "staging" | "prod";
  isDataSeeded: boolean;
}

abstract class BaseHandler implements RequestHandler {
  private nextHandler: RequestHandler | null = null;

  setNext(handler: RequestHandler): RequestHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: TestRequest): string | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class AuthCheckHandler extends BaseHandler {
  handle(request: TestRequest): string | null {
    if (!request.hasValidToken) {
      return "Ошибка: невалидный токен авторизации";
    }
    return super.handle(request);
  }
}

class EnvironmentCheckHandler extends BaseHandler {
  handle(request: TestRequest): string | null {
    if (request.environment === "prod") {
      return "Ошибка: тесты запрещено запускать на prod";
    }
    return super.handle(request);
  }
}

class DataSeedCheckHandler extends BaseHandler {
  handle(request: TestRequest): string | null {
    if (!request.isDataSeeded) {
      return "Ошибка: тестовые данные не подготовлены";
    }
    return super.handle(request);
  }
}

const auth = new AuthCheckHandler();
const env = new EnvironmentCheckHandler();
const seed = new DataSeedCheckHandler();
auth.setNext(env).setNext(seed);

const result = auth.handle({ hasValidToken: true, environment: "staging", isDataSeeded: false });
console.log(result); // "Ошибка: тестовые данные не подготовлены"
```

## На что смотрит интервьюер

Интервьюер обычно спрашивает, чем паттерн отличается от простой цепочки `if/else` — правильный ответ: обработчики инкапсулированы в отдельные объекты с единым интерфейсом, цепочку можно собирать и менять динамически, а клиент не знает деталей каждого обработчика. Могут спросить про реальные примеры из инфраструктуры — middleware в Express/Koa/NestJS, обработчики событий в DOM (bubbling), фильтры сервлетов — это всё Chain of Responsibility. Частая ошибка кандидатов — не упомянуть, что запрос может пройти всю цепочку без обработки, и не предусмотреть это поведение явно. Также могут спросить об отличии от Decorator: оба передают вызов дальше по цепочке объектов, но Decorator гарантированно вызывает обёрнутый объект и добавляет поведение, а Chain of Responsibility может прервать цепочку и вообще не передать запрос дальше.
