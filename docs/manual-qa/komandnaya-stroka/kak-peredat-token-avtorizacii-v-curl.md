---
id: kak-peredat-token-avtorizacii-v-curl
title: "Передача токена авторизации в curl"
sidebar_position: 19
tags: ["Командная строка"]
---

# Как передать токен авторизации в `curl`?

**Коротко:** токен передаётся через заголовок `Authorization`, чаще всего в формате `Bearer <token>`, с помощью флага `-H`: `curl -H "Authorization: Bearer <token>" https://api.example.com/data`.

## Развёрнутый ответ

Большинство современных API используют авторизацию через HTTP-заголовок `Authorization`. Схема зависит от типа токена и протокола:

- **Bearer-токен (JWT, OAuth 2.0)** — самый распространённый вариант: `-H "Authorization: Bearer <token>"`. Используется в большинстве REST API с токен-based аутентификацией.
- **Basic Auth** — логин и пароль, закодированные в base64: `curl -u username:password https://api.example.com` (curl сам добавит корректный заголовок `Authorization: Basic <base64>`).
- **API Key в заголовке** — некоторые сервисы используют собственные заголовки, например `-H "X-API-Key: <key>"`.
- **API Key в query-параметре** — реже, но встречается: `curl "https://api.example.com/data?api_key=<key>"`.

Практические нюансы:

- Токен обычно предварительно получают отдельным запросом (например, через эндпоинт `/login` или `/oauth/token`), а затем сохраняют в переменную окружения, чтобы не хранить его в открытом виде в истории команд или в скрипте.
- Для безопасности не рекомендуется вписывать токен напрямую в скрипт, который попадёт в систему контроля версий — лучше использовать переменные окружения или секреты CI/CD.
- Если сервер ожидает конкретный тип токена (например, `Bearer` против `Token`), важно указать именно ту схему, которую он ожидает, иначе будет ошибка `401 Unauthorized`.

## Пример / когда применяется

```bash
# Передача Bearer-токена напрямую
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/profile

# Хранение токена в переменной окружения (не в истории команд явно)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/profile

# Basic Auth (логин/пароль)
curl -u admin:secret https://api.example.com/admin

# Комбинация: получить токен через один запрос и использовать в следующем
TOKEN=$(curl -s -X POST https://api.example.com/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "secret"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" https://api.example.com/orders
```

## На что смотрит интервьюер

- Знает ли кандидат про заголовок `Authorization` и распространённые схемы (`Bearer`, `Basic`).
- Понимает ли разницу между Basic Auth (`-u user:pass`) и Bearer-токеном (`-H "Authorization: Bearer ..."`).
- Умеет ли безопасно работать с токеном: не хардкодить его в скриптах, использовать переменные окружения.
- Может ли описать полный сценарий: получение токена через запрос логина и последующее использование его в заголовках следующих запросов (что часто встречается в реальном E2E-тестировании API).
- Красный флаг: путаница между заголовком и query-параметром, либо незнание того, что токен нужно получить заранее, а не просто "придумать".
