import { vi, describe, expect, it } from "vitest";
import ChannelInfo from ".";

vi.mock("../../controllers/ChatController", () => {
  class MockChatController {
    setChatUsers = vi.fn();
    getChatUsers = vi.fn();
  }

  return {
    default: MockChatController,
  };
});

vi.mock("../../controllers/UserController", () => {
  class MockUserController {
    userSearch = vi.fn();
  }

  return {
    default: MockUserController,
  };
});

vi.mock("../../core/Store", () => ({
  default: {
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe("Компонент ChannelInfo", () => {
  const block = new ChannelInfo({
    show: true,
  });

  describe("Проверка передачи свойств", () => {
    it("show", () => {
      expect(block.element()?.querySelectorAll(".popup").length).toBe(1);
    });
  });
});
