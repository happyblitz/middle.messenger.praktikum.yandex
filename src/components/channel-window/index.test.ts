import { beforeEach, describe, expect, it, vi } from "vitest";
import ChannelWindow from ".";
import { testChat } from "../../fixtures/chat";
import { testUser } from "../../fixtures/user";
import store from "../../core/Store";
import type { DomElement } from "../../core/Block";

vi.mock("../../core/Store", () => ({
  default: {
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock("../channel-info", () => {
  class MockChannelInfo {
    element() {
      const div = document.createElement("div");
      div.textContent = "channel-info";
      return div;
    }
    setProps() {}
    mountComponent() {}
    unmountComponent() {}
  }

  return { default: MockChannelInfo };
});

vi.mock("../button", () => {
  class MockButton {
    element() {
      const div = document.createElement("div");
      div.textContent = "button";
      return div;
    }
    setProps() {}
    mountComponent() {}
    unmountComponent() {}
  }

  return { default: MockButton };
});

vi.mock("../../controllers/ChatController", () => {
  class MockChatController {
    getChatUsers() {}
  }

  return { default: MockChatController };
});

vi.mock("../../controllers/ChatWebSocketController", () => {
  class MockSocketController {
    init() {}
    getMessages() {}
    send() {}
    clearMessages() {}
    unmount() {}
  }

  return { default: MockSocketController };
});

vi.mock("../../controllers/ResourceController", () => {
  class MockResourceController {
    fileWasProcessed() {}
  }

  return { default: MockResourceController };
});

describe("Компонент ChannelWindow", () => {
  const chat = testChat();
  let block;
  let element: DomElement;

  const user = testUser();

  vi.spyOn(store, "getState").mockReturnValue({
    isAuthorized: true,
    chats: [],
    messages: {},
    user: user,
    chatUsers: { [chat.id]: [user] },
  });

  beforeEach(() => {
    block = new ChannelWindow({
      chat,
      onBack: vi.fn(),
      chatUsers: [testUser()],
    });

    element = block.element();
  });

  describe("Проверка передачи свойств", () => {
    it("чат не выбран", () => {
      block = new ChannelWindow({
        onBack: vi.fn(),
      });

      element = block.element();
      expect(element?.querySelectorAll(".channel__no-active")?.length).toBe(1);
    });

    it("чат выбран", () => {
      expect(element?.querySelectorAll(".channel__no-active")?.length).toBe(0);
    });
  });
});
