---
id: chto-takoe-ws-security
title: "Что такое WS-Security"
sidebar_position: 29
tags: ["API"]
---

# Что такое WS-Security?

**Коротко:** WS-Security — стандарт OASIS, описывающий, как обеспечивать конфиденциальность, целостность и аутентификацию сообщений SOAP на уровне самого сообщения, а не транспорта.

## Развёрнутый ответ

WS-Security (Web Services Security, WSS) — это спецификация, разработанная OASIS, которая определяет расширения SOAP-протокола для обеспечения безопасности при обмене сообщениями между веб-сервисами. В отличие от транспортного уровня безопасности (например, HTTPS/TLS, который защищает канал передачи данных целиком), WS-Security работает на уровне самого SOAP-сообщения (message-level security) — это означает, что защита сохраняется даже если сообщение проходит через несколько промежуточных узлов (посредников), а не только между двумя конечными точками.

Основные механизмы, которые предоставляет WS-Security:

- **Аутентификация (Authentication)** — передача учётных данных в заголовке SOAP-сообщения через элемент `UsernameToken` (логин/пароль, часто пароль передаётся в виде хэша с использованием nonce и timestamp для защиты от replay-атак) или через X.509-сертификаты (Binary Security Token).
- **Целостность сообщения (Integrity)** — использование XML Digital Signature для подписи части или всего содержимого сообщения, что позволяет получателю убедиться, что сообщение не было изменено в пути.
- **Конфиденциальность (Confidentiality)** — использование XML Encryption для шифрования части или всего тела сообщения, чтобы содержимое не могло быть прочитано посредниками.
- **Токены безопасности (Security Tokens)** — поддержка различных типов токенов: UsernameToken, X.509 Certificate Token, SAML Token, Kerberos Token.
- **Timestamp** — элемент с меткой времени создания и срока действия сообщения, защищающий от replay-атак (повторной отправки перехваченного сообщения).

Все эти элементы добавляются в специальный заголовок `<wsse:Security>` внутри `<soap:Header>` SOAP-конверта.

WS-Security часто используется совместно с другими стандартами семейства WS-*, такими как WS-Trust (управление токенами и их обменом) и WS-SecureConversation (установление защищённого контекста сессии для последовательности сообщений).

Важное отличие от простого HTTP Basic Auth поверх HTTPS: WS-Security обеспечивает end-to-end безопасность на уровне сообщения, что критично в сценариях с несколькими посредниками (например, ESB — Enterprise Service Bus), где TLS-соединение может обрываться и устанавливаться заново на каждом хопе, а подпись/шифрование сообщения остаются неизменными от отправителя до конечного получателя.

## Пример / когда применяется

Пример заголовка SOAP-сообщения с UsernameToken:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>testuser</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">
          Zm9vYmFyZGlnZXN0
        </wsse:Password>
        <wsse:Nonce>MTIzNDU2</wsse:Nonce>
        <wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
          2026-07-09T10:00:00Z
        </wsu:Created>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <!-- тело запроса -->
  </soapenv:Body>
</soapenv:Envelope>
```

При тестировании в SoapUI/ReadyAPI можно настроить WS-Security конфигурацию (Outgoing WSS: добавление UsernameToken/подписи/шифрования; Incoming WSS: проверка и расшифровка ответа) прямо в проекте, без ручного формирования XML вручную.

WS-Security применяется в корпоративных интеграциях (банковский сектор, государственные системы, enterprise SOA/ESB), где SOAP до сих пор широко используется, а требования к безопасности сообщений выше, чем просто "передавать по HTTPS".

## На что смотрит интервьюер

- Понимает ли кандидат разницу между transport-level security (TLS/HTTPS) и message-level security (WS-Security) и в каких случаях последнее необходимо.
- Знает ли основные типы токенов (UsernameToken, X.509, SAML) и механизмы (XML Signature, XML Encryption).
- Может ли объяснить назначение Timestamp/Nonce для защиты от replay-атак.
- Красный флаг: кандидат считает, что HTTPS полностью заменяет WS-Security и не понимает сценариев с посредниками (ESB, несколько хопов).
- Follow-up: "Чем WS-Security отличается от OAuth в REST?", "Что такое WS-Trust?", "Как проверить корректность подписи SOAP-сообщения в SoapUI?"
