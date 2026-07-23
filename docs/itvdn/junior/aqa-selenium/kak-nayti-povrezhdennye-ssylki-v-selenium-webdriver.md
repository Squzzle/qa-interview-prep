---
id: kak-nayti-povrezhdennye-ssylki-v-selenium-webdriver
title: "Поиск повреждённых ссылок в Selenium"
sidebar_position: 16
tags: ["AQA — Selenium"]
---

# Как найти поврежденные ссылки в Selenium WebDriver?

**Коротко:** Selenium сам по себе не проверяет HTTP-статусы, поэтому нужно собрать все ссылки со страницы через `findElements(By.tagName("a"))`, извлечь `href` у каждой, отправить HTTP-запрос (обычно `HttpURLConnection` или библиотекой типа `HttpClient`/`RestAssured`) и проверить код ответа — ссылка считается битой, если код 400 и выше.

## Развёрнутый ответ

Важно понимать: сам WebDriver не умеет проверять коды ответа сервера — он оперирует только DOM и рендерингом. Проверка "битых" ссылок (404, 500, таймауты, редиректы в никуда) — это задача на стыке UI-автоматизации и HTTP-запросов, поэтому реализация комбинирует Selenium (для сбора ссылок со страницы) и обычный HTTP-клиент (для проверки статуса).

Алгоритм:

1. Открыть страницу через `driver.get(url)`.
2. Собрать все элементы `<a>` через `driver.findElements(By.tagName("a"))`.
3. Для каждого элемента получить атрибут `href` через `getAttribute("href")`.
4. Отфильтровать некорректные/нерелевантные ссылки — пустые `href`, `javascript:void(0)`, `mailto:`, `tel:`, якорные ссылки (`#section`).
5. Для каждого валидного URL открыть HTTP-соединение (без загрузки полного тела ответа — использовать метод `HEAD` для скорости, если сервер его поддерживает) и получить код ответа.
6. Считать ссылку битой, если код ответа `>= 400` (Client Error / Server Error).

Важные нюансы:
- Нужно обрабатывать относительные ссылки, приводя их к абсолютным (через `java.net.URL(baseUrl, href)`).
- Нужно ставить разумный таймаут на соединение и чтение, чтобы одна зависшая ссылка не блокировала весь прогон.
- Стоит логировать не только код ответа, но и саму ссылку, и текст, откуда она взята, для удобства дебага.
- Для больших сайтов проверку часто делают параллельно (пул потоков), чтобы не проверять сотни ссылок последовательно.

## Пример / когда применяется

```java
public List<String> getBrokenLinks(WebDriver driver) {
    List<String> brokenLinks = new ArrayList<>();
    List<WebElement> links = driver.findElements(By.tagName("a"));

    for (WebElement link : links) {
        String href = link.getAttribute("href");
        if (href == null || href.isEmpty() || href.startsWith("mailto:") || href.startsWith("tel:")) {
            continue;
        }
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(href).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.connect();
            int responseCode = connection.getResponseCode();
            if (responseCode >= 400) {
                brokenLinks.add(href + " -> " + responseCode);
            }
        } catch (Exception e) {
            brokenLinks.add(href + " -> ERROR: " + e.getMessage());
        }
    }
    return brokenLinks;
}
```

Применяется в smoke-тестах после деплоя, в регрессионных проверках навигационного меню, футера, карты сайта (sitemap), а также в SEO-related проверках качества контента.

## На что смотрит интервьюер

Интервьюер проверяет понимание того, что проверка кодов ответа — это НЕ функция Selenium WebDriver, а отдельная HTTP-логика поверх собранных ссылок; ответ "Selenium сам проверяет статус ссылки" — красный флаг. Хороший кандидат упомянет использование `HEAD`-запроса вместо `GET` для оптимизации, обработку относительных ссылок, таймауты и фильтрацию нерелевантных `href` (`javascript:`, `mailto:`, якоря). Могут спросить про масштабирование решения на весь сайт (краулинг + параллелизация) и про то, как отличить "битую" ссылку от, например, ссылки, требующей авторизации (401/403 — не обязательно "битая" ссылка, а ожидаемое поведение).
