import "../styles/main.scss";
import NavigationPage from "../pages/navigation";
import ErrorPage from "../pages/error";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import MessengerPage from "../pages/messenger";
import type { DomElement } from "../utils/Block";

const app = document.querySelector("[data-js-main]");

if (!app) {
  throw new Error("attrubute [data-js-main] not found");
}

type GetContent = {
  element(): DomElement;
};

function insertContent(obj: GetContent) {
  const element = obj.element();
  if (element && app) {
    app.replaceChildren(element);
  }
}

const routes: Record<string, () => void> = {
  "/": () => {
    const links = {
      "/": "Список страниц",
      "/login": "Авторизация",
      "/register": "Регистрация",
      "/403": "Ошибка 403",
      "/404": "Ошибка 404",
      "/500": "Ошибка 500",
      "/messenger": "Мессенджер",
    };

    const content = new NavigationPage({ links });
    insertContent(content);
  },
  "/403": () => {
    const content = new ErrorPage({
      code: 403,
      code_message: "Доступ запрещен",
    });
    insertContent(content);
  },
  "/404": () => {
    const content = new ErrorPage({
      code: 404,
      code_message: "Страница не найдена",
    });
    insertContent(content);
  },
  "/500": () => {
    const content = new ErrorPage({
      code: 500,
      code_message: "Внутрення ошибка сервера",
    });
    insertContent(content);
  },
  "/login": () => {
    const content = new LoginPage();
    insertContent(content);
  },
  "/register": () => {
    const content = new RegisterPage();
    insertContent(content);
  },
  "/messenger": () => {
    const content = new MessengerPage();
    insertContent(content);
  },
};

const render = () => {
  const path = window.location.pathname;

  const activeRoute = routes[path] || routes["/404"];
  activeRoute();
};

render();
