import Block from "./Block";
import store from "./Store";
import type { RoutesConfig } from "../scripts/route.settings";

class Router {
  private static __instance: Router;
  protected routes;
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
          state.isAuthorized
            ? this.goto(routesConfig.afterLogInRedirect)
            : this.goto(routesConfig.afterLogOutRedirect);
        },
        observer: (state) => {
          return state.isAuthorized;
        },
      });
    }

    window.addEventListener("popstate", () => {
      this.goto(window.location.pathname);
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

  public static getInstance(routesConfig: RoutesConfig): Router {
    if (!Router.__instance) {
      Router.__instance = new Router(routesConfig);
    }

    return Router.__instance;
  }

  public goto(path: string) {
    window.history.pushState({}, "", path);

    const newpath = path || "/";

    const route =
      this.routes[newpath] || this.routes["/404"] || this.routes["/"];

    if (!route) {
      return;
    }

    if (route.routeRules?.rule() === false) {
      this.goto(route.routeRules.redirect);
      return;
    }

    this.currentBlock?.forceUnmounComponent();

    const newBlock = new route.blockClass(route.props);
    this.currentBlock = newBlock;

    const element = this.currentBlock.element();
    if (element) {
      this.app.replaceChildren(element);
    }
  }
}

export default Router;
