---
id: chto-takoe-page-element-component-object-chem-on
title: "Page Element и Component Object отличия"
sidebar_position: 22
tags: ["Инициализация браузера и Selenium"]
---

# Что такое Page Element / Component Object? Чем он отличается от Page Object?

**Коротко:** Page Object описывает целую страницу целиком, а Page Element / Component Object описывает переиспользуемый, самодостаточный фрагмент UI (шапка, модальное окно, карточка товара, таблица), который может встречаться на нескольких разных страницах и инкапсулируется в отдельный класс во избежание дублирования кода.

## Развёрнутый ответ

По мере роста приложения одни и те же UI-компоненты (навигационное меню, хедер с логотипом и профилем пользователя, модальные окна подтверждения, таблицы с пагинацией, карточки товаров) повторяются на множестве страниц. Если каждый Page Object будет заново описывать локаторы и логику для этих общих частей, возникнет дублирование кода и множественные точки отказа при изменении верстки.

Component Object (иногда называют Page Fragment или Widget) решает эту проблему:
- Инкапсулирует локаторы и методы, относящиеся только к своему фрагменту DOM (а не ко всей странице).
- Обычно принимает в конструктор либо `WebDriver`, либо (что более правильно с точки зрения инкапсуляции) корневой `WebElement`/`SearchContext` данного фрагмента, чтобы искать вложенные элементы относительно него, а не по всему документу.
- Может использоваться как поле внутри нескольких разных Page Object — например, `HeaderComponent` используется и на `HomePage`, и на `CartPage`, и на `ProfilePage`.

Ключевые отличия от Page Object:

| Критерий | Page Object | Component Object |
|---|---|---|
| Область охвата | Вся страница целиком | Часть DOM, повторяющаяся на разных страницах |
| Переиспользование | Обычно уникален для одной страницы/URL | Переиспользуется в нескольких Page Object |
| Контекст поиска элементов | Обычно относительно всего `driver` | Относительно корневого элемента компонента |
| Пример | `LoginPage`, `CheckoutPage` | `HeaderComponent`, `ModalDialog`, `TableComponent` |

Component Object также упрощает тестирование сложных виджетов: например, `TableComponent` может предоставлять метод `getRowByText(String text)` или `sortByColumn(String columnName)`, инкапсулируя логику работы с динамическими строками таблицы независимо от того, на какой странице эта таблица используется.

## Пример / когда применяется

```java
public class HeaderComponent {
    private final WebElement root;

    public HeaderComponent(WebElement root) {
        this.root = root;
    }

    public void logout() {
        root.findElement(By.id("logoutBtn")).click();
    }

    public String getUserName() {
        return root.findElement(By.className("user-name")).getText();
    }
}

public class HomePage {
    private WebDriver driver;
    private HeaderComponent header;

    public HomePage(WebDriver driver) {
        this.driver = driver;
        WebElement headerRoot = driver.findElement(By.id("header"));
        this.header = new HeaderComponent(headerRoot);
    }

    public HeaderComponent header() {
        return header;
    }
}
```

Тест: `homePage.header().logout();` — метод логаута переиспользуется без дублирования на каждой странице, где есть хедер.

## На что смотрит интервьюер

Проверяет понимание именно проблемы дублирования и композиции, а не формальное определение. Хороший ответ приводит конкретный пример переиспользуемого компонента (хедер, модалка, таблица) и объясняет, почему поиск элементов внутри компонента должен быть ограничен его корневым контекстом (`SearchContext`), а не всем документом — это предотвращает случайные совпадения с одноимёнными элементами в других частях страницы. Follow-up: «как передать компонент в несколько Page Object без дублирования кода инициализации» и «что если на странице несколько экземпляров одного компонента» (например, несколько карточек товара — компонент должен принимать конкретный корневой `WebElement`, а не искать по всему документу).
