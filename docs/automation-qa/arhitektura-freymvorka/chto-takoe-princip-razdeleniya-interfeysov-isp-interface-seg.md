---
id: chto-takoe-princip-razdeleniya-interfeysov-isp-interface-seg
title: "Принцип разделения интерфейсов ISP"
sidebar_position: 12
tags: ["Архитектура фреймворка"]
---

# Что такое принцип разделения интерфейсов (ISP, Interface Segregation Principle)?

**Коротко:** ISP гласит, что клиент не должен зависеть от методов, которые он не использует — лучше иметь несколько узких, специализированных интерфейсов, чем один большой универсальный, чтобы классы реализовывали только то, что им реально нужно.

## Развёрнутый ответ

Принцип разделения интерфейсов сформулирован Робертом Мартином на основе опыта проектирования систем, где "толстые" интерфейсы вынуждали классы реализовывать методы, которые им не нужны, — либо пустыми заглушками, либо выбрасывающими исключение `NotImplementedException`. Это прямой путь к нарушению LSP и к хрупкой архитектуре: изменение одного метода в большом интерфейсе затрагивает все классы, которые его реализуют, даже если конкретный класс этим методом не пользуется.

Признаки нарушения ISP:

- Интерфейс содержит много методов, логически относящихся к разным зонам ответственности (например, `IPage` с методами и для UI-взаимодействия, и для работы с cookies, и для скриншотов, и для сравнения с эталоном).
- Реализующие классы вынуждены оставлять часть методов пустыми или бросающими исключение.
- При добавлении метода в общий интерфейс приходится вносить изменения во все классы-реализации, даже неиспользующие новый метод.

В автоматизации тестирования ISP особенно важен при проектировании базовых интерфейсов для Page Object'ов, драйверов и клиентов API. Если создать один огромный интерфейс `IBasePage` со всеми возможными операциями (клик, ввод текста, скриншот, работа с алертами, работа с фреймами, drag&drop, мобильные жесты), то Page Object для простой статической страницы будет вынужден "реализовывать" методы работы с мобильными жестами, которые ему никогда не нужны. Правильный подход — декомпозировать такой интерфейс на несколько узких: `Clickable`, `TextInputtable`, `Screenshotable`, `Swipeable` и т.д., и каждый Page Object реализует только те, что ему действительно требуются (через композицию или множественную реализацию интерфейсов).

## Пример / когда применяется

```ts
// Плохо: один "толстый" интерфейс заставляет реализовывать лишнее
interface IBasePage {
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  swipeLeft(): Promise<void>;
  swipeRight(): Promise<void>;
  takeScreenshot(): Promise<Buffer>;
}

class StaticWebPage implements IBasePage {
  async click(selector: string): Promise<void> {}
  async type(selector: string, text: string): Promise<void> {}
  // веб-страница не поддерживает свайпы, но обязана "реализовать" их
  async swipeLeft(): Promise<void> {
    throw new Error('Not supported on web');
  }
  async swipeRight(): Promise<void> {
    throw new Error('Not supported on web');
  }
  async takeScreenshot(): Promise<Buffer> {
    return Buffer.from('');
  }
}

// Хорошо: интерфейсы разделены по назначению
interface Clickable {
  click(selector: string): Promise<void>;
}
interface TextInputtable {
  type(selector: string, text: string): Promise<void>;
}
interface Swipeable {
  swipeLeft(): Promise<void>;
  swipeRight(): Promise<void>;
}
interface Screenshotable {
  takeScreenshot(): Promise<Buffer>;
}

class StaticWebPage implements Clickable, TextInputtable, Screenshotable {
  async click(selector: string): Promise<void> {}
  async type(selector: string, text: string): Promise<void> {}
  async takeScreenshot(): Promise<Buffer> {
    return Buffer.from('');
  }
}

class MobilePage implements Clickable, Swipeable, Screenshotable {
  async click(selector: string): Promise<void> {}
  async swipeLeft(): Promise<void> {}
  async swipeRight(): Promise<void> {}
  async takeScreenshot(): Promise<Buffer> {
    return Buffer.from('');
  }
}
```

ISP применяется при проектировании базовых интерфейсов Page Object, интерфейсов драйверов для кросс-платформенного тестирования (Web/Mobile/Desktop), а также интерфейсов API-клиентов, где не каждый сервис поддерживает все операции (CRUD).

## На что смотрит интервьюер

- Понимание разницы между ISP и SRP: SRP — про ответственность класса, ISP — про то, каким контрактом клиент вынужден пользоваться.
- Способность привести пример "толстого" интерфейса именно из практики автотестов (базовый Page Object, базовый драйвер).
- Follow-up: "Как ISP связан с LSP?" — узкие интерфейсы облегчают соблюдение LSP, так как классу не приходится подделывать нереализуемое поведение.
- Красный флаг — если кандидат путает интерфейсы и абстрактные классы или не видит связи между большим интерфейсом и хрупкостью кода.
