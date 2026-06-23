import { describe, expect, it } from "vitest";
import NavigationPage from ".";

describe("Компонент NavigationPage", () => {
  describe("Проверка отображения списка чатов", () => {
    const links = {
      "/link1": "title1",
      "/link2": "title2",
      "/link3": "title3",
    };
    const block = new NavigationPage({
      links,
    });

    it("code", () => {
      expect(block.element()?.querySelectorAll("li")?.length).toBe(
        Object.keys(links).length,
      );
    });
  });
});
