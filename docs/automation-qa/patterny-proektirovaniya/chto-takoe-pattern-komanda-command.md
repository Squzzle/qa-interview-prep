---
id: chto-takoe-pattern-komanda-command
title: "Паттерн Команда Command"
sidebar_position: 15
tags: ["Паттерны проектирования (GoF)"]
---

# Что такое паттерн Команда (Command)?

**Коротко:** Command — поведенческий паттерн, который инкапсулирует запрос (действие с параметрами и получателем) в отдельный объект, позволяя параметризовать клиентов разными запросами, откладывать или ставить их в очередь, логировать и поддерживать отмену операций.

## Развёрнутый ответ

Паттерн отделяет объект, инициирующий действие (`Invoker`), от объекта, который это действие фактически выполняет (`Receiver`), вводя между ними промежуточный объект-команду (`Command`). Команда инкапсулирует всё необходимое для выполнения действия: ссылку на получателя, метод, который нужно вызвать, и параметры вызова — и предоставляет единый интерфейс, обычно с методом `execute()`.

Основные участники:

- **Command** — интерфейс с методом `execute()` (и часто `undo()`).
- **ConcreteCommand** — конкретная команда, хранящая ссылку на `Receiver` и параметры, реализующая `execute()` через вызов методов получателя.
- **Receiver** — объект, который содержит бизнес-логику и реально выполняет действие.
- **Invoker** — инициирует выполнение команды (например, кнопка, планировщик, очередь), не зная деталей самого действия — он лишь вызывает `command.execute()`.
- **Client** — создаёт конкретные команды и настраивает, каким получателем и какими параметрами они будут пользоваться.

Что даёт инкапсуляция запроса в объект:

- Возможность **отложенного выполнения** и **постановки в очередь** — команды можно хранить, сериализовать, передавать по сети, выполнять асинхронно.
- Поддержка **отмены/повтора операций (undo/redo)** — если команда хранит состояние, необходимое для отката, или сама реализует обратное действие.
- **Логирование и аудит** выполненных операций — раз каждая операция это объект, её легко залогировать до/после выполнения.
- **Макрокоманды** — объединение нескольких команд в одну составную (пересекается с паттерном Composite).
- Снижение связанности между Invoker и Receiver — Invoker работает только с интерфейсом Command.

## Пример / когда применяется

В автотестах Command удобен для построения очереди тестовых действий, шагов с возможностью отката состояния, либо для реализации записи/воспроизведения сценариев (record & replay).

```ts
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class ShoppingCartReceiver {
  private items: string[] = [];

  addItem(item: string): void {
    this.items.push(item);
    console.log(`Товар добавлен: ${item}`);
  }

  removeItem(item: string): void {
    this.items = this.items.filter((i) => i !== item);
    console.log(`Товар удалён: ${item}`);
  }

  getItems(): string[] {
    return [...this.items];
  }
}

class AddItemCommand implements Command {
  constructor(private receiver: ShoppingCartReceiver, private item: string) {}

  async execute(): Promise<void> {
    this.receiver.addItem(this.item);
  }

  async undo(): Promise<void> {
    this.receiver.removeItem(this.item);
  }
}

// Invoker — хранит историю выполненных команд для undo
class TestActionInvoker {
  private history: Command[] = [];

  async run(command: Command): Promise<void> {
    await command.execute();
    this.history.push(command);
  }

  async undoLast(): Promise<void> {
    const command = this.history.pop();
    if (command) {
      await command.undo();
    }
  }
}

const cart = new ShoppingCartReceiver();
const invoker = new TestActionInvoker();

await invoker.run(new AddItemCommand(cart, "Ноутбук"));
await invoker.run(new AddItemCommand(cart, "Мышь"));
console.log(cart.getItems()); // ["Ноутбук", "Мышь"]

await invoker.undoLast();
console.log(cart.getItems()); // ["Ноутбук"]
```

## На что смотрит интервьюер

Ожидается чёткое разделение ролей Invoker/Command/Receiver — частая ошибка кандидатов сводить Command просто к «функции-обёртке» и не упоминать про undo/очереди/логирование, которые и являются главной ценностью паттерна. Могут спросить про реальные аналоги: обработчики кликов в UI-фреймворках, задачи в очередях сообщений, транзакционные операции с откатом, паттерн "команда" в Redux-подобных архитектурах (actions). Также интервьюер может попросить сравнить Command со Strategy: оба инкапсулируют поведение в объект с единым интерфейсом, но Strategy — про выбор одного из взаимозаменяемых алгоритмов решения одной задачи, а Command — про инкапсуляцию произвольного запроса с возможностью его отложить, поставить в очередь или отменить.
