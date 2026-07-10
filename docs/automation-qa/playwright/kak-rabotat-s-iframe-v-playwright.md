---
id: kak-rabotat-s-iframe-v-playwright
title: "Работа с iframe"
sidebar_position: 19
tags: ["Playwright"]
---

# Как работать с iframe в Playwright?

**Коротко:** Для работы с элементами внутри `iframe` используется метод `page.frameLocator(selector)`, который возвращает `FrameLocator` — объект, позволяющий искать элементы внутри фрейма теми же методами, что и на обычной странице, без ручного переключения контекста.

## Развёрнутый ответ

В отличие от Selenium, где для работы с iframe требуется явно переключаться (`switchTo().frame()`), Playwright использует декларативный подход через `FrameLocator`. Метод `page.frameLocator(selector)` находит iframe по CSS-селектору и возвращает объект, у которого есть те же методы поиска элементов (`locator()`, `getByRole()`, `getByText()` и т.д.), что и у `Page`. Благодаря автоматическому ожиданию (auto-waiting) не нужно вручную ждать загрузки фрейма — Playwright сам дождётся его появления и готовности перед взаимодействием с элементом внутри.

Если нужен доступ к самому объекту `Frame` (например, для проверки URL фрейма или получения содержимого), можно использовать `page.frames()` — список всех фреймов на странице, либо `elementHandle.contentFrame()` для конкретного `<iframe>`-элемента. Однако этот подход менее надёжен, так как требует ручной синхронизации, и в современном коде рекомендуется использовать именно `frameLocator`.

Вложенные iframe (iframe внутри iframe) обрабатываются последовательным вызовом `frameLocator` от родительского к дочернему: `page.frameLocator('#outer').frameLocator('#inner').locator(...)`.

Важный нюанс: если iframe размещён на другом домене (cross-origin), это не создаёт проблем для Playwright (в отличие от прямого доступа через `contentDocument` в чистом JS), так как Playwright работает через протокол CDP (Chrome DevTools Protocol) на уровне браузера, а не через ограничения same-origin policy JavaScript.

## Пример / когда применяется

```javascript
// Работа с элементом внутри iframe
const frame = page.frameLocator('#payment-frame');
await frame.locator('input[name="card-number"]').fill('4242424242424242');
await frame.getByRole('button', { name: 'Оплатить' }).click();

// Вложенные iframe
await page.frameLocator('#outer-frame')
  .frameLocator('#inner-frame')
  .getByText('Подтвердить').click();

// Получение списка всех фреймов на странице
for (const f of page.frames()) {
  console.log(f.url());
}
```

Типичное применение — тестирование платёжных виджетов (Stripe, PayPal), встроенных в iframe для изоляции от основной страницы, а также встроенных виджетов чатов, капч, рекламных блоков и сторонних форм.

## На что смотрит интервьюер

Интервьюер проверяет знание `frameLocator` как основного современного способа работы с iframe и понимание, чем он отличается от прямого доступа через `page.frames()` или `contentFrame()` (автоматическое ожидание vs ручная синхронизация). Частая ошибка — попытка найти элемент внутри iframe через обычный `page.locator()`, что не сработает, так как содержимое iframe изолировано от DOM основной страницы. Также могут спросить про работу с вложенными фреймами и про то, как Playwright обходит ограничения same-origin policy благодаря работе через CDP.
