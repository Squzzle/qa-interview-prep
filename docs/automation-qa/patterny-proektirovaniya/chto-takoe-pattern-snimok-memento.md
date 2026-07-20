---
id: chto-takoe-pattern-snimok-memento
title: "Паттерн Снимок Memento"
sidebar_position: 18
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Снимок (Memento)?

**Коротко:** Memento — поведенческий паттерн, позволяющий сохранить и восстановить внутреннее состояние объекта, не нарушая его инкапсуляцию (реализация undo/rollback).

## Развёрнутый ответ

Задача паттерна — дать возможность "откатить" объект к предыдущему состоянию (undo, история изменений, транзакции), при этом не раскрывая наружу детали его внутренней структуры. Прямое решение — сделать все поля объекта публичными, чтобы кто-то извне мог их сохранить и восстановить — но это ломает инкапсуляцию. Memento решает это иначе.

Три участника:

- **Originator** — объект, чьё состояние нужно сохранять; умеет создавать снимок (`save()`) и восстанавливаться из него (`restore(memento)`).
- **Memento** — неизменяемый (immutable) объект-снимок состояния. Обычно имеет узкий публичный интерфейс (например, только метаданные вроде даты создания) и широкий интерфейс, доступный только Originator'у — это можно реализовать через приватные поля, доступные благодаря замыканию, вложенному классу или пакетной видимости.
- **Caretaker (хранитель)** — хранит список снимков (историю), но никогда не заглядывает и не изменяет их содержимое — он просто просит Originator создать снимок и просит его же восстановиться из выбранного снимка.

Ключевой принцип: Caretaker управляет *когда* сохранять/восстанавливать, но не имеет доступа к *что* внутри снимка — это и есть сохранение инкапсуляции.

Типичные реализации в TypeScript/JS: снимок как замороженный (`Object.freeze`) глубокий клон состояния, либо сериализация в JSON.

Отличие от Command с поддержкой undo: Command инкапсулирует действие и его отмену как операцию, а Memento инкапсулирует само состояние. Их часто комбинируют: Command хранит Memento, чтобы реализовать откат.

## Пример / когда применяется

В автотестах Memento полезен для сохранения состояния тестового окружения или данных формы перед деструктивным шагом, чтобы откатиться после негативного сценария без пересоздания всего контекста.

```ts
class FormState {
  private constructor(private readonly fields: Readonly<Record<string, string>>) {}

  static of(fields: Record<string, string>): FormState {
    return new FormState({ ...fields });
  }

  getFields(): Record<string, string> {
    return { ...this.fields };
  }
}

class RegistrationForm {
  private fields: Record<string, string> = {};

  fillField(name: string, value: string): void {
    this.fields[name] = value;
  }

  save(): FormState {
    return FormState.of(this.fields);
  }

  restore(snapshot: FormState): void {
    this.fields = snapshot.getFields();
  }
}

class TestHistory {
  private snapshots: FormState[] = [];

  push(snapshot: FormState): void {
    this.snapshots.push(snapshot);
  }

  pop(): FormState | undefined {
    return this.snapshots.pop();
  }
}

// Использование в тесте
const form = new RegistrationForm();
const history = new TestHistory();

form.fillField("email", "user@test.com");
history.push(form.save());

form.fillField("email", "corrupted");
form.restore(history.pop()!); // откат к валидному состоянию
```

## На что смотрит интервьюер

- Понимание сохранения инкапсуляции — многие путают Memento с обычным сериализуемым DTO без разделения ролей Originator/Caretaker.
- Знание, что Memento должен быть неизменяемым.
- Follow-up: "Как ограничить рост памяти при хранении множества снимков?" — ожидается ответ про лимит истории, weak references или периодическую очистку.
- Отличие от простого клонирования объекта (Prototype) — Memento именно про историю состояний и роль Caretaker, а не про создание копий для дальнейшей независимой модификации.
- Красный флаг: если кандидат не может объяснить, зачем нужен отдельный Caretaker, а не просто массив состояний в самом Originator.
