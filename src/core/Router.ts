import Block from "./Block";
import type { RouteConfig } from "../scripts/route.settings";

class Router {
  protected routes;
  protected currentBlock: Block<object> | null = null;
  protected app: Element;

  constructor(routes: Record<string, RouteConfig>) {
    this.app = document.querySelector("[data-js-main]") as HTMLElement;
    if (!this.app) {
      throw new Error("attrubute [data-js-main] not found");
    }

    this.routes = routes;

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

  public goto(path: string) {
    window.history.pushState({}, "", path);

    const newpath = path || "/";

    const route =
      this.routes[newpath] || this.routes["/404"] || this.routes["/"];

    if (!route) {
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
