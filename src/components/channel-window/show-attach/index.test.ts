import { describe, expect, it } from "vitest";
import ShowAttach from ".";

describe("Компонент ShowAttach", () => {
  describe("Проверка передачи свойств", () => {
    const filename: string = "test";

    const block = new ShowAttach({
      filename,
    });

    const element = block.element();

    it("filename", () => {
      expect(
        element?.querySelector(".channel__footer-attached-filename")
          ?.textContent,
      ).toBe(filename);
    });
  });
});
