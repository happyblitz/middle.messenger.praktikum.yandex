import { describe, expect, it, vi } from "vitest";
import ChannelMessage from ".";
import { testMessage } from "../../../fixtures/message";

vi.mock("../../../core/Store", () => ({
  default: {
    getState: () => ({
      chatUsers: [],
    }),
    subscribe: vi.fn(),
  },
}));

vi.mock("../../avatar", () => {
  class MockAvatar {
    element() {
      const div = document.createElement("div");
      div.innerHTML = "Avatar";
      return div;
    }
    setProps() {}
    mountComponent() {}
    unmountComponent() {}
  }

  return { default: MockAvatar };
});

describe("Компонент ChannelMessage", () => {
  const chatId = 23;
  const message = testMessage({ chat_id: chatId });

  describe("Проверка передачи свойств", () => {
    const block = new ChannelMessage({
      chatId,
      message,
    });

    const element = block.element();

    it("message", () => {
      expect(
        element?.querySelector(".channel__message-message")?.textContent,
      ).toBe(message.content);
    });
  });
});
