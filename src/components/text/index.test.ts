import { describe, expect, it } from "vitest";
import Text from ".";

describe("Компонент Text", () => {
  describe("Проверка передачи свойств", () => {
    it("text", () => {
      const text = "some text";
      const block = new Text({
        text,
      });

      expect(block.element()?.textContent).toBe(text);
    });
  });
});
