---
id: kakie-instrumenty-dlya-testirovaniya-web-performance-client
title: "Инструменты Web performance client-side"
sidebar_position: 8
tags: ["Web"]
---

# Какие инструменты для тестирования Web performance client-side знаете?

**Коротко:** Для тестирования клиентской производительности используются Chrome DevTools (Performance, Lighthouse, Network), а также специализированные инструменты — WebPageTest, PageSpeed Insights, GTmetrix и метрики Core Web Vitals (LCP, FID/INP, CLS).

## Развёрнутый ответ

Клиентская производительность (client-side performance) оценивается по тому, насколько быстро страница загружается, становится интерактивной и остаётся отзывчивой в браузере пользователя. Основные метрики (Core Web Vitals от Google):

- **LCP (Largest Contentful Paint)** — время отрисовки самого крупного видимого элемента контента. Хорошо: до 2.5с.
- **INP (Interaction to Next Paint)**, ранее **FID (First Input Delay)** — задержка реакции интерфейса на действие пользователя. Хорошо: до 200мс.
- **CLS (Cumulative Layout Shift)** — суммарный показатель неожиданных смещений элементов при загрузке. Хорошо: до 0.1.
- **TTFB (Time to First Byte)** — время получения первого байта ответа от сервера.
- **FCP (First Contentful Paint)** — время отрисовки первого контента.
- **TTI (Time to Interactive)** — время, когда страница становится полностью интерактивной.

Инструменты для измерения и анализа:

- **Chrome DevTools → Performance** — запись таймлайна выполнения: JS execution, layout, paint, composite. Позволяет находить длительные задачи (long tasks), блокирующие главный поток.
- **Chrome DevTools → Lighthouse** — автоматизированный аудит производительности, доступности, SEO, best practices; выдаёт числовую оценку и конкретные рекомендации (сжатие изображений, минификация, lazy loading).
- **Chrome DevTools → Network** — анализ размера и времени загрузки ресурсов, waterfall-диаграмма запросов, throttling для эмуляции медленной сети (3G/4G).
- **WebPageTest** — облачный сервис для замера производительности с реальных локаций и устройств, детальная waterfall-диаграмма, видео загрузки страницы (filmstrip).
- **PageSpeed Insights** — сервис Google, объединяющий лабораторные (Lighthouse) и полевые данные (реальные пользователи через CrUX — Chrome User Experience Report).
- **GTmetrix** — аналог PageSpeed с дополнительными метриками и историей замеров.
- **Web Vitals JS-библиотека** — позволяет собирать реальные метрики Core Web Vitals прямо на продакшене и отправлять в аналитику (RUM — Real User Monitoring).
- **Bundle-анализаторы** (webpack-bundle-analyzer, source-map-explorer) — не измеряют скорость напрямую, но помогают найти избыточный вес JS-бандла, влияющий на TTI.

## Пример / когда применяется

Пример команды для CI-проверки производительности через Lighthouse CLI:

```bash
npx lighthouse https://example.com --output=json --output-path=./report.json --chrome-flags="--headless"
```

Пример сбора метрик Core Web Vitals на клиенте:

```js
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP((metric) => sendToAnalytics('LCP', metric.value));
onINP((metric) => sendToAnalytics('INP', metric.value));
onCLS((metric) => sendToAnalytics('CLS', metric.value));
```

Типичный сценарий использования в тестировании: перед релизом прогнать Lighthouse в CI и установить порог (например, Performance score не ниже 90), а на проде подключить RUM для отслеживания реальных метрик пользователей на разных устройствах и сетях.

## На что смотрит интервьюер

Ожидается знание конкретных названий инструментов и метрик, а не общая фраза "проверю скорость загрузки". Хороший ответ включает разницу между лабораторными измерениями (synthetic, Lighthouse/WebPageTest — фиксированные условия) и полевыми данными (RUM, CrUX — реальные пользователи с разными устройствами и сетями), а также упоминание Core Web Vitals как индустриального стандарта. Красный флаг — незнание, что такое LCP/CLS/INP при заявленном опыте тестирования производительности.
