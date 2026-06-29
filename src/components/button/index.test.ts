import { describe, expect, it } from "vitest";
import Button from ".";

describe("Компонент Button", () => {
  describe("Проверка передачи свойств", () => {
    const block = new Button({
      text: "special",
      type: "password",
      disabled: true,
      ariaLabel: "myArea",
      title: "myButton",
      className: ["btn1"],
    });

    const element = block.element() as HTMLButtonElement;

    it("text", () => {
      expect(element?.textContent).toBe("special");
    });
    it("type", () => {
      expect(element?.getAttribute("type")).toBe("password");
    });
    it("disabled", () => {
      expect(element?.disabled).toBe(true);
    });
    it("ariaLabel", () => {
      expect(element?.getAttribute("aria-label")).toBe("myArea");
    });
    it("title", () => {
      expect(element?.getAttribute("title")).toBe("myButton");
    });
    it("html classes", () => {
      expect(element?.classList.contains("btn1")).toBe(true);
    });
  });
});
