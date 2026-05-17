import Block from "../core/Block";
import NavigationPage from "../pages/navigation";
import navLinks from "./navigation.links";
import ErrorPage from "../pages/error";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import MessengerPage from "../pages/messenger";

// @INFO any
// каждый экземпляр блока принимает пропсы своего вида,
// этот вид нам неважен, мы просто прокинем их в класс блока
export type RouteConfig = {
  blockClass: new (props?: Record<string, any>) => Block<any>;
  props?: Record<string, any>;
};

const ROUTES: Record<string, RouteConfig> = {
  "/": {
    blockClass: NavigationPage,
    props: {
      links: navLinks,
    },
  },
  "/login": { blockClass: LoginPage },
  "/register": { blockClass: RegisterPage },
  "/403": {
    blockClass: ErrorPage,
    props: {
      code: 403,
      code_message: "Доступ запрещен",
    },
  },
  "/404": {
    blockClass: ErrorPage,
    props: {
      code: 404,
      code_message: "Страница не найдена",
    },
  },
  "/500": {
    blockClass: ErrorPage,
    props: {
      code: 500,
      code_message: "Внутрення ошибка сервера",
    },
  },
  "/messenger": { blockClass: MessengerPage },
} as const;

export default ROUTES;
