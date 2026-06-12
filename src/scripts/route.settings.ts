import store from "../core/Store";
import Block from "../core/Block";
import NavigationPage from "../pages/navigation";
import navLinks from "./navigation.links";
import ErrorPage from "../pages/error";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import MessengerPage from "../pages/messenger";
import ProfilePage from "../pages/profile";

type RouteRules = {
  rule: () => boolean; // должно вернуть true, иначе редирект
  redirect: keyof typeof ROUTES.routes;
};

// @INFO any
// каждый экземпляр блока принимает пропсы своего вида,
// этот вид нам неважен, мы просто прокинем их в класс блока
type RouteConfig = {
  blockClass: new (props?: Record<string, unknown>) => Block<object>;
  props?: Record<string, unknown>;
  routeRules?: RouteRules;
};

export type RoutesConfig = {
  afterLogInRedirect: string;
  afterLogOutRedirect: string;
  routes: Record<string, RouteConfig>;
};

export const afterLogInRedirect = "/messenger";
export const afterLogOutRedirect = "/sign-in";

const ROUTES: RoutesConfig = {
  afterLogInRedirect,
  afterLogOutRedirect,
  routes: {
    "/sign-in": {
      blockClass: LoginPage,
      routeRules: {
        rule: () => !store.isAuthorized(),
        redirect: afterLogInRedirect,
      },
    },
    "/sign-up": {
      blockClass: RegisterPage,
      routeRules: {
        rule: () => !store.isAuthorized(),
        redirect: afterLogInRedirect,
      },
    },
    "/messenger": {
      blockClass: MessengerPage,
      routeRules: {
        rule: () => store.isAuthorized(),
        redirect: afterLogOutRedirect,
      },
    },
    "/settings": {
      blockClass: ProfilePage,
      routeRules: {
        rule: () => store.isAuthorized(),
        redirect: afterLogOutRedirect,
      },
    },
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
    "/": {
      blockClass: NavigationPage,
      props: {
        links: navLinks,
      },
    },
  },
} as const;

export default ROUTES;
