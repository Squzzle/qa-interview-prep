---
id: chto-takoe-manifest-xml-v-apk-fayle-i
title: "AndroidManifest.xml в APK файле"
sidebar_position: 2
tags: ["Mobile"]
---

# Что такое Manifest.xml в .apk файле и какие данные там указывают?

**Коротко:** `AndroidManifest.xml` — обязательный конфигурационный файл в корне `.apk`, который описывает приложение системе Android: его компоненты, требуемые разрешения, минимальную версию ОС и другие метаданные, необходимые до запуска кода.

## Развёрнутый ответ

`AndroidManifest.xml` — это XML-файл, который присутствует в каждом Android-приложении и упаковывается в `.apk`/`.aab`. Система Android читает его до запуска какого-либо кода приложения, поэтому в нём должна быть описана вся информация, нужная системе для управления приложением.

В манифесте указывается:

- **Имя пакета** (`package`) — уникальный идентификатор приложения, по которому оно определяется в системе и в Google Play.
- **Компоненты приложения**: активити (`<activity>`), сервисы (`<service>`), широковещательные приёмники (`<receiver>`), провайдеры контента (`<provider>`) — каждый компонент должен быть объявлен в манифесте, иначе система о нём не узнает.
- **Разрешения (permissions)** — какие системные разрешения требует приложение (доступ к камере, геолокации, контактам, интернету и т.д.), через `<uses-permission>`.
- **Требования к оборудованию и ПО** (`<uses-feature>`, `<uses-sdk>`) — минимальная (`minSdkVersion`), целевая (`targetSdkVersion`) и максимальная версии Android, а также обязательные аппаратные возможности (камера, NFC и т.п.).
- **Intent-фильтры** (`<intent-filter>`) — какие намерения (intents) может обрабатывать компонент, в том числе определение главной активити (`MAIN`/`LAUNCHER`) и deep link'ов.
- **Метаданные приложения**: иконка, название, тема оформления, версия (`versionCode`, `versionName`), поддерживаемые экраны.
- **Библиотеки и зависимости**, которые должны быть слинкованы с приложением.

Без корректного манифеста приложение либо не будет установлено, либо система не сможет корректно запустить его компоненты (например, забытая регистрация активити приведёт к `ActivityNotFoundException`).

## Пример / когда применяется

Фрагмент типичного `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service android:name=".SyncService" />
    </application>
</manifest>
```

Тестировщик использует манифест, чтобы понять, какие разрешения запрашивает приложение (для проверки экрана согласий permissions), какая минимальная версия Android поддерживается (для планирования матрицы устройств), и какие deep link'и нужно протестировать.

## На что смотрит интервьюер

Интервьюер проверяет, понимает ли кандидат, что манифест — это не просто «файл настроек», а декларация компонентов и разрешений, критичная для функционирования приложения. Плюсом будет знание, что для распаковки и просмотра манифеста из `.apk` используются инструменты вроде `apktool` или `aapt dump badging`, а также понимание разницы между `minSdkVersion` и `targetSdkVersion` в контексте тестирования на разных версиях Android.
