import Block from "./Block";
import store from "./Store";
import type { RoutesConfig } from "../scripts/route.settings";

class Router {
  private static __instance: Router;
  protected routes;
  protected currentRoute: string = "";
  protected currentBlock: Block<object> | null = null;
  protected app: Element;

  private constructor(routesConfig: RoutesConfig) {
    this.app = document.querySelector("[data-js-main]") as HTMLElement;
    if (!this.app) {
      throw new Error("attrubute [data-js-main] not found");
    }

    this.routes = routesConfig.routes;

    if (routesConfig.afterLogInRedirect && routesConfig.afterLogOutRedirect) {
      store.subscribe({
        action: (state) => {
          if (state.isAuthorized) {
            this.goto(routesConfig.afterLogInRedirect);
          } else {
            this.goto(routesConfig.afterLogOutRedirect);
          }
        },
        observer: (state) => {
          return state.isAuthorized;
        },
      });
    }

    window.addEventListener("popstate", () => {
      this.gotoHidden(window.location.pathname);
    });

    document.addEventListener("click", (event) => {
      const anchor = (event.target as HTMLElement)?.closest("a");
      if (anchor) {
        const path = anchor.getAttribute("href");
        if (path && path.startsWith("/")) {
          event.preventDefault();
          this.goto(path);
        }
      }
    });
  }

  /**
   * Конструктор приватный, поэтому создаем инстанс через этот метод
   * Можно было бы прописать это сразу в конструкторе - то плохо,
   * конструктор не для этого предназначен
   * @param routesConfig
   * @returns
   */
  public static getInstance(routesConfig?: RoutesConfig): Router {
    if (!Router.__instance) {
      if (routesConfig) {
        Router.__instance = new Router(routesConfig);
      } else {
        throw new Error("init router before the call");
      }
    }

    return Router.__instance;
  }

  /**
   * Редирект с сохранением истории
   * @param path
   * @returns
   */
  public goto(path: string) {
    window.history.pushState({}, "", path);
    this.gotoHidden(path);
  }

  /**
   * Редирект без сохранения истории
   * в противном случае при событии popstate,
   * мы перезапишем историю в возвращаться вперед будет некуда
   * @param path
   * @returns
   */
  public gotoHidden(path: string) {
    const newpath = path || "/";

    let routeKey: string = "";

    if (this.routes[newpath]) {
      routeKey = newpath;
    } else {
      for (const key of Object.keys(this.routes)) {
        if (path.startsWith(key)) {
          routeKey = key;
          break;
        }
      }
    }

    if (!routeKey) {
      if ("/404" in this.routes) {
        routeKey = "/404";
      } else if ("/" in this.routes) {
        routeKey = "/";
      }
    }

    if (!routeKey) {
      return;
    }

    const route = this.routes[routeKey];

    if (route.routeRules?.rule() === false) {
      this.gotoHidden(route.routeRules.redirect);
      return;
    }

    this.currentBlock?.forceUnmounComponent();

    this.currentBlock = new route.blockClass(route?.props);
    this.currentRoute = routeKey;

    const element = this.currentBlock.element();
    if (element) {
      this.app.replaceChildren(element);
    }
  }

  public getArgs() {
    const path = window.location.pathname.slice(this.currentRoute.length);
    return { params: path.split("/"), queryParams: {} };
  }
}

export default Router;
