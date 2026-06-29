import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import store from "./Store";
import Block from "./Block";
import Router from "./Router";

vi.mock("./Store", () => ({
  default: {
    isAuthorized: vi.fn(),
    subscribe() {},
  },
}));

describe("Роутер", () => {
  class TestBlock extends Block<object> {
    protected template = "";

    element() {
      return document.createElement("div");
    }

    forceUnmounComponent() {}
  }

  const afterLogInRedirect = "/private";
  const afterLogOutRedirect = "/logIn";

  const testRoutes = {
    afterLogInRedirect,
    afterLogOutRedirect,
    routes: {
      "/": {
        blockClass: TestBlock,
      },
      "/404": {
        blockClass: TestBlock,
      },
      "/logIn": {
        blockClass: TestBlock,
        routeRules: {
          rule: () => !store.isAuthorized(),
          redirect: afterLogInRedirect,
        },
      },
      "/logOut": {
        blockClass: TestBlock,
        routeRules: {
          rule: () => !store.isAuthorized(),
          redirect: afterLogInRedirect,
        },
      },
      "/private": {
        blockClass: TestBlock,
        routeRules: {
          rule: () => store.isAuthorized(),
          redirect: afterLogOutRedirect,
        },
      },
      "/propsPage": {
        blockClass: TestBlock,
        props: {
          a: 1,
          b: 2,
        },
      },
    },
  };

  let route: Router | null;

  beforeEach(() => {
    document.body.innerHTML = '<main class="main" data-js-main></main>';
    route = Router.getInstance(testRoutes);
    route.goto("/");
  });

  afterEach(() => {
    // @ts-expect-error Type 'undefined' is not assignable to type 'Router'
    Router.__instance = undefined;
    route = null;
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("Навигация", () => {
    it("Вызов pushState", () => {
      const spy = vi.spyOn(window.history, "pushState");
      route!.goto("/logIn");
      route!.goto("/propsPage");
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("Запрет доступа без авторизации", () => {
      vi.spyOn(store, "isAuthorized").mockReturnValue(false);
      route!.goto("/private");
      expect(route!["currentRoute"]).toBe(afterLogOutRedirect);
    });

    it("Разрешен доступ с авторизацией", () => {
      vi.spyOn(store, "isAuthorized").mockReturnValue(true);
      route!.goto("/private");
      expect(route!["currentRoute"]).toBe("/private");
    });

    it("Работа кнопки браузера: back", async () => {
      const promise = new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
      });

      vi.spyOn(store, "isAuthorized").mockReturnValue(true);
      route!.goto("/private");
      window.history.back();

      await promise;

      expect(route!["currentRoute"]).toBe("/");
    });

    it("Работа кнопки браузера: forward", async () => {
      let promise = new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
      });

      vi.spyOn(store, "isAuthorized").mockReturnValue(true);
      route!.goto("/private");
      window.history.back();

      await promise;

      promise = new Promise((resolve) => {
        window.addEventListener("popstate", resolve, { once: true });
      });

      window.history.forward();

      await promise;

      expect(route!["currentRoute"]).toBe("/private");
    });

    it("Страница не найдена, 404", async () => {
      vi.spyOn(store, "isAuthorized").mockReturnValue(true);
      route!.goto("/asdf54vb");
      expect(route!["currentRoute"]).toBe("/404");
    });
  });
});
