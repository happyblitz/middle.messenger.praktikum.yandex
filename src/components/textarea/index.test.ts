import { describe, expect, it } from "vitest";
import TextArea from ".";

describe("Компонент TextArea", () => {
  describe("Проверка передачи свойств", () => {
    const name = "testName";
    const placeholder = "testPlaceholder";
    const block = new TextArea({
      name,
      placeholder,
    });

    it("name", () => {
      expect(block.element()?.getAttribute("name")).toBe(name);
    });
    it("placeholder", () => {
      expect(block.element()?.getAttribute("placeholder")).toBe(placeholder);
    });
  });
});
