---
id: chto-takoe-wsdl
title: "Что такое WSDL"
sidebar_position: 8
tags: ["API"]
---

# Что такое WSDL?

**Коротко:** WSDL (Web Services Description Language) — это XML-формат для описания SOAP веб-сервисов: какие операции доступны, какие данные они принимают и возвращают, и по какому адресу к ним обращаться.

## Развёрнутый ответ

WSDL является формальным, машиночитаемым контрактом SOAP-сервиса. Он позволяет клиенту (и инструментам разработки) автоматически сгенерировать код-заглушку (stub) для вызова сервиса, не изучая его реализацию вручную.

WSDL-документ состоит из следующих основных секций:
- **types** — описание типов данных, используемых в сообщениях (обычно через XML Schema, XSD).
- **message** — описание структуры входящих и исходящих сообщений (какие параметры передаются).
- **portType** (в WSDL 2.0 — interface) — набор абстрактных операций (методов), которые предоставляет сервис, с указанием входящих и исходящих сообщений.
- **binding** — связывает абстрактные операции с конкретным протоколом и форматом (например, SOAP поверх HTTP).
- **service** — указывает физический адрес (URL, endpoint), по которому доступен сервис.

Благодаря такой структуре WSDL строго типизирует все операции: заранее известно, сколько параметров принимает метод, какого они типа, что вернётся в ответе и какая структура у возможной ошибки (SOAP Fault). Это отличает SOAP от REST, где формальное описание контракта (OpenAPI) чаще необязательно и может расходиться с реальным поведением.

Инструменты вроде SoapUI умеют импортировать WSDL и автоматически генерировать тестовые запросы под каждую операцию сервиса, что существенно ускоряет ручное и автоматизированное тестирование SOAP API.

## Пример / когда применяется

Упрощённый фрагмент WSDL для сервиса получения курса валют:

```xml
<definitions name="CurrencyService"
   targetNamespace="http://example.com/currency">
  <message name="GetRateRequest">
    <part name="from" type="xsd:string"/>
    <part name="to" type="xsd:string"/>
  </message>
  <message name="GetRateResponse">
    <part name="rate" type="xsd:decimal"/>
  </message>
  <portType name="CurrencyPortType">
    <operation name="GetExchangeRate">
      <input message="tns:GetRateRequest"/>
      <output message="tns:GetRateResponse"/>
    </operation>
  </portType>
  <binding name="CurrencyBinding" type="tns:CurrencyPortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetExchangeRate">
      <soap:operation soapAction="GetExchangeRate"/>
    </operation>
  </binding>
  <service name="CurrencyService">
    <port name="CurrencyPort" binding="tns:CurrencyBinding">
      <soap:address location="http://example.com/currency-service"/>
    </port>
  </service>
</definitions>
```

WSDL применяется всегда, когда нужно интегрироваться с SOAP-сервисом: тестировщик получает WSDL-файл, импортирует его в SoapUI/Postman и сразу видит доступные операции и структуру запросов.

## На что смотрит интервьюер

- Знает ли кандидат, что WSDL — это описание именно SOAP-сервиса (не REST).
- Понимает ли основные секции WSDL (types, message, portType, binding, service) хотя бы на уровне назначения, не обязательно наизусть.
- Может ли рассказать, как WSDL используется на практике (импорт в SoapUI, генерация клиента).
- Красный флаг: путает WSDL с WSDL-подобными форматами REST (OpenAPI/Swagger) или не может объяснить назначение файла вообще.
