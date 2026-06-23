import { describe, expect, it } from "vitest";
import InfoMessage from ".";
import type { DomElement } from "../../core/Block";

describe("Компонент InfoMessage", () => {
  const messageText = "some message";
  let block;
  let element: DomElement;

  describe("Проверка передачи свойств", () => {
    it("text", () => {
      block = new InfoMessage({
        text: messageText,
      });

      element = block.element();

      expect(element?.querySelector("p")?.textContent).toBe(messageText);
    });

    it("error", () => {
      block = new InfoMessage({
        text: messageText,
        error: true,
      });

      element = block.element();

      expect(
        element?.querySelector("p")?.classList.contains("error-message"),
      ).toBe(true);
    });

    it("success", () => {
      block = new InfoMessage({
        text: messageText,
        success: true,
      });

      element = block.element();

      expect(
        element?.querySelector("p")?.classList.contains("success-message"),
      ).toBe(true);
    });
  });
});
