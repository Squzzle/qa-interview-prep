---
id: chto-takoe-page-object-model-opishite-ego-strukturu
title: "Page Object Model структура и преимущества"
sidebar_position: 21
tags: ["Инициализация браузера и Selenium"]
---

# Что такое Page Object Model? Опишите его структуру и преимущества.

**Коротко:** Page Object Model (POM) — паттерн проектирования автотестов, при котором каждая страница (или значимая её часть) описывается отдельным классом, инкапсулирующим локаторы и методы взаимодействия с этой страницей, а сами тесты работают только с высокоуровневым API этих классов, не зная деталей верстки.

## Развёрнутый ответ

Идея POM — разделить ответственность между тремя слоями:
1. **Page Object** — класс, представляющий конкретную страницу или экран приложения. Содержит приватные поля-локаторы (`By` или `@FindBy`) и публичные методы, описывающие бизнес-действия на этой странице (`login(user, pass)`, `submitOrder()`), а не низкоуровневые технические шаги.
2. **Тестовый класс** — использует методы Page Object для построения сценария теста и делает assert-проверки, но никогда не обращается к локаторам напрямую.
3. (Опционально) **Page Element / Component Object** — переиспользуемые части UI (шапка, модальное окно, таблица), общие для нескольких страниц.

Структура типового Page Object:
- Конструктор, принимающий `WebDriver` (или получающий его из общего контекста), часто инициализирующий поля через `PageFactory.initElements(driver, this)`.
- Локаторы элементов страницы как приватные поля.
- Публичные методы высокого уровня, возвращающие либо `void`, либо следующий Page Object (fluent-навигация), например `HomePage homePage = loginPage.login(user, pass)`.
- Метод проверки, что страница действительно загружена (`isLoaded()` / verification в конструкторе).

Преимущества POM:
- **Устранение дублирования** — локаторы и логика взаимодействия описаны один раз, а не копипастятся в каждом тесте.
- **Лёгкость поддержки** — при изменении верстки достаточно поправить один Page Object, а не десятки тестов.
- **Читаемость тестов** — тест выглядит как последовательность бизнес-действий (`loginPage.login(...)`, `cartPage.checkout()`), а не как набор `findElement`/`click`.
- **Разделение ответственности** — тестировщики, пишущие тесты, могут не знать деталей локаторов; изменения верстки изолированы в Page Object слое.
- **Переиспользование** — один и тот же Page Object используется в разных тестовых сценариях.

Недостатки/ограничения: при неаккуратной реализации POM может разрастись в громоздкие "God Object" классы с сотнями методов; для сложных UI часто дополнительно выделяют Component Object для переиспользуемых частей.

## Пример / когда применяется

```java
public class LoginPage {
    private WebDriver driver;

    @FindBy(id = "username") private WebElement usernameField;
    @FindBy(id = "password") private WebElement passwordField;
    @FindBy(id = "loginBtn") private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public HomePage login(String user, String pass) {
        usernameField.sendKeys(user);
        passwordField.sendKeys(pass);
        loginButton.click();
        return new HomePage(driver);
    }
}
```

Тест:
```java
@Test
public void loginSuccess() {
    LoginPage loginPage = new LoginPage(driver);
    HomePage homePage = loginPage.login("user", "pass");
    assertTrue(homePage.isWelcomeMessageDisplayed());
}
```

## На что смотрит интервьюер

Ожидает чёткое разделение ответственности между тестом и Page Object, а не просто "класс с локаторами". Хороший ответ упоминает fluent-навигацию (возврат следующего Page Object) и отсутствие assert-ов внутри Page Object (проверки — задача теста, а не страницы). Follow-up: «как избежать дублирования локаторов общих элементов (шапка, футер)» (ответ — Component Object/базовый класс), «в чём разница между Page Object и Screenplay pattern». Красный флаг — смешение бизнес-логики теста и assert-ов внутри Page Object класса.
