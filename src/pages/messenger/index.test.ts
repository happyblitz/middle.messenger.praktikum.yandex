import { describe, expect, it, vi } from "vitest";
import MessengerPage from ".";
import { testChat } from "../../fixtures/chat";

const makeMockComponent = vi.hoisted(() => (text: string) => {
  return class {
    setProps() {}
    unmountComponent() {}
    mountComponent() {}
    element() {
      const div = document.createElement("div");
      div.textContent = text;
      return div;
    }
  };
});

vi.mock("../../components/channel-card", () => ({
  default: makeMockComponent("mock channel card"),
}));
vi.mock("../../components/channel-window", () => ({
  default: makeMockComponent("mock channel window"),
}));
vi.mock("../../components/new-channel", () => ({
  default: makeMockComponent("mock new channel"),
}));
vi.mock("../../components/button", () => ({
  default: makeMockComponent("mock button"),
}));

vi.mock("../../core/Store", () => ({
  default: {
    getState: () => ({
      chats: [testChat, testChat],
    }),
    subscribe: () => 1,
  },
}));

describe("Компонент MessengerPage", () => {
  describe("Проверка отображения списка чатов", () => {
    const block = new MessengerPage();

    it("code", () => {
      expect(
        block.element()?.querySelectorAll(".channels__list li")?.length,
      ).toBe(2);
    });
  });
});
