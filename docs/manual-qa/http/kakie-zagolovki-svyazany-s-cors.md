---
id: kakie-zagolovki-svyazany-s-cors
title: "Заголовки HTTP связанные с CORS"
sidebar_position: 26
tags: ["HTTP"]
---

# Какие заголовки связаны с CORS?

**Коротко:** CORS реализуется через набор HTTP-заголовков запроса (`Origin`, `Access-Control-Request-*`) и ответа (`Access-Control-Allow-*`), которые сервер использует, чтобы разрешить или запретить браузеру доступ к ресурсу с другого origin.

## Развёрнутый ответ

Заголовки CORS делятся на те, что отправляет браузер (запрос), и те, что должен вернуть сервер (ответ).

**Заголовки запроса (от браузера):**
- `Origin` — указывает origin страницы, с которой отправляется запрос. Отправляется автоматически браузером и не может быть подделан JS-кодом.
- `Access-Control-Request-Method` — используется только в preflight-запросе (`OPTIONS`), сообщает, каким методом будет выполнен реальный запрос.
- `Access-Control-Request-Headers` — используется только в preflight, перечисляет кастомные заголовки, которые будут в реальном запросе.

**Заголовки ответа (от сервера):**
- `Access-Control-Allow-Origin` — обязательный заголовок; указывает, какому origin разрешён доступ к ответу. Может быть конкретным доменом (`https://frontend.com`) или `*` (для всех, но без credentials).
- `Access-Control-Allow-Methods` — перечисляет разрешённые HTTP-методы (GET, POST, PUT, DELETE и т.д.).
- `Access-Control-Allow-Headers` — перечисляет заголовки, которые клиент может отправлять в реальном запросе.
- `Access-Control-Allow-Credentials` — булево значение (`true`), разрешает браузеру отправлять и получать куки/авторизационные данные в кросс-доменных запросах. При этом `Access-Control-Allow-Origin` не может быть `*`, только конкретный origin.
- `Access-Control-Expose-Headers` — по умолчанию JS видит только базовый набор заголовков ответа (safelist); этот заголовок открывает доступ к дополнительным заголовкам, например `X-Total-Count`.
- `Access-Control-Max-Age` — время в секундах, на которое браузер может закэшировать результат preflight-запроса, чтобы не отправлять `OPTIONS` перед каждым запросом.

## Пример / когда применяется

Пример полноценной настройки CORS на сервере, разрешающей запросы с куками:

```text
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

На клиенте при этом нужно явно указать, что запрос должен включать куки:

```text
fetch('https://api.backend.com/data', { credentials: 'include' })
```

## На что смотрит интервьюер

- Знание, что `Access-Control-Allow-Origin: *` несовместим с `Access-Control-Allow-Credentials: true` — частый вопрос-ловушка.
- Понимание разницы между заголовками, которые видны в preflight, и теми, что в реальном ответе.
- Умение объяснить, зачем нужен `Access-Control-Expose-Headers` (по умолчанию JS не видит кастомные заголовки ответа).
- Красный флаг — если кандидат не может назвать ни одного заголовка, кроме `Access-Control-Allow-Origin`.
