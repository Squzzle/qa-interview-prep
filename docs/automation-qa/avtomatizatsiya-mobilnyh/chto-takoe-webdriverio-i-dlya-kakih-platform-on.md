---
id: chto-takoe-webdriverio-i-dlya-kakih-platform-on
title: "Что такое WebdriverIO и его платформы"
sidebar_position: 8
tags: ["Автоматизация мобильных приложений"]
---

# Что такое WebdriverIO и для каких платформ он может использоваться?

**Коротко:** WebdriverIO (WDIO) — это JavaScript/Node.js фреймворк для автоматизации тестирования, построенный на протоколах WebDriver и WebDriver BiDi, который используется как для веб-тестирования в браузерах, так и для мобильного тестирования (Android и iOS) через интеграцию с Appium.

## Развёрнутый ответ

WebdriverIO — это тестовый фреймворк уровня выше "чистого" клиента WebDriver: он включает раннер тестов, поддержку синхронного и асинхронного API, встроенные ассершены, репортеры, параллельный запуск и богатую систему плагинов (сервисов и репортеров).

Ключевые области применения:

- **Веб-тестирование** — кроссбраузерное тестирование через WebDriver/DevTools protocol (Chrome, Firefox, Safari, Edge), включая визуальное регрессионное тестирование через сторонние плагины.

- **Мобильное тестирование** — WebdriverIO интегрируется с Appium через `wdio-appium-service`, что позволяет писать тесты для нативных, гибридных и мобильных веб-приложений на Android и iOS, используя тот же синтаксис и структуру проекта, что и для веб-тестов.

- **Гибридные/Electron-приложения** — WDIO также поддерживает тестирование desktop-приложений на Electron.

Преимущества WebdriverIO для мобильной автоматизации:

- единая кодовая база и синтаксис для web и mobile тестов;
- встроенные удобства: авто-ретраи, `expect-webdriverio` для читаемых ассертов, параллельный запуск тестов;
- богатая экосистема сервисов (`@wdio/appium-service`, репортеры Allure/Spec/JSON, интеграции с BrowserStack/Sauce Labs);
- конфигурация через единый `wdio.conf.js`, где можно комбинировать capabilities для разных платформ (Android, iOS, браузеры) в одном тестовом сьюте.

## Пример / когда применяется

Фрагмент конфигурации `wdio.conf.js` для мобильного теста через Appium:

```js
exports.config = {
  services: ['appium'],
  port: 4723,
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Pixel_6',
    'appium:app': '/path/to/app.apk'
  }]
};
```

Пример теста:

```js
it('should login successfully', async () => {
  await $('~username_field').setValue('user');
  await $('~password_field').setValue('pass');
  await $('~login_button').click();
  await expect($('~welcome_text')).toBeDisplayed();
});
```

## На что смотрит интервьюер

Важно понимать, что WebdriverIO сам по себе не заменяет Appium для мобильного тестирования — он выступает клиентом/фреймворком поверх Appium Server, отвечающим за структуру тестов, конфигурацию и репортинг, тогда как непосредственное взаимодействие с устройством всё равно идёт через Appium и его драйверы (UiAutomator2/XCUITest). Может последовать вопрос о разнице между WebdriverIO и "чистым" Appium Java/Python клиентом, а также про поддержку WebDriver BiDi протокола в последних версиях.
