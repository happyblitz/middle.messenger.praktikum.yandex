import { vi, describe, expect, it } from "vitest";
import Input from ".";
import type { DomElement } from "../../core/Block";

vi.mock("../info-message", () => {
  class MockInfoMessage {
    setProps() {}
    element() {
      const div = document.createElement("div");
      div.textContent = "mock info message";
      return div;
    }
    unmountComponent() {}
    mountComponent() {}
  }

  return { default: MockInfoMessage };
});

describe("Компонент Input", () => {
  const name = "testName";
  let block;
  let element: DomElement;

  describe("Проверка передачи свойств", () => {
    it("type", () => {
      const type = "password";

      block = new Input({
        name,
        type,
      });

      element = block.element();

      expect(element?.querySelector("input")?.getAttribute("type")).toBe(type);
    });
  });
});
