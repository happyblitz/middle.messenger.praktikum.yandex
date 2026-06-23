import { vi, describe, expect, it } from "vitest";
import NewChannel from ".";

vi.mock("../../controllers/ChatController", () => {
  class MockChatController {
    newChat() {}
  }

  return { default: MockChatController };
});

describe("Компонент NewChannel", () => {
  let block;

  describe("Проверка передачи свойств", () => {
    it("show false", () => {
      block = new NewChannel({
        show: false,
      });

      expect(block.element()?.querySelectorAll(".popup")?.length).toBe(0);
    });
    it("show true", () => {
      block = new NewChannel({
        show: true,
      });

      expect(block.element()?.querySelectorAll(".popup")?.length).toBe(1);
    });
  });
});
