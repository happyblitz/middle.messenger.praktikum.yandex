import { describe, expect, it } from "vitest";
import ErrorPage from ".";

describe("Компонент ErrorPage", () => {
  describe("Проверка передачи свойств", () => {
    const code = "1000";
    const code_message = "test code message";
    // @ts-ignore
    const block = new ErrorPage({
      code,
      code_message,
    });

    it("code", () => {
      expect(block.element()?.querySelector("h1")?.textContent).toBe(code);
    });
    it("code_message", () => {
      expect(block.element()?.querySelector("h2")?.textContent).toBe(
        code_message,
      );
    });
  });
});
