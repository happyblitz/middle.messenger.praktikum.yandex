import { beforeEach, describe, expect, it, vi } from "vitest";
import ChannelCard from ".";
import Avatar from "../avatar";
import store from "../../core/Store";
import type { Chat } from "../../core/Store";
import { testChat } from "../../fixtures/chat";

vi.mock("../../core/Store", () => ({
  default: {
    subscribe() {},
  },
}));

const chatTitleClassName = ".channel-card__user";

describe("Компонент ChannelCard", () => {
  const chat: Chat = testChat();

  let block: ChannelCard;

  beforeEach(() => {
    block = new ChannelCard({
      chat,
      isActive: true,
      onSelect: vi.fn,
    });

    block.element();
  });

  describe("Проверка передачи свойств", () => {
    it("isActive", () => {
      expect(block.element()?.classList.contains("isActive")).toBe(true);
    });
    it("title", () => {
      expect(
        block.element()?.querySelector(chatTitleClassName)?.textContent,
      ).toBe(chat.title);
    });
  });

  describe("Дочерние элементы созданы", () => {
    it("avatar", () => {
      expect(block.children.avatar instanceof Avatar).toBe(true);
    });
  });

  describe("Обновление компонентов произошло", () => {
    // @ts-ignore
    let saveCallback;

    vi.spyOn(store, "subscribe").mockImplementation((callback) => {
      saveCallback = callback;
      return () => {};
    });

    it("avatar property changed", () => {
      const updatedAvatar = {
        ...chat,
        avatar: "/some.img",
      };

      // @ts-ignore
      saveCallback.action({ chats: [updatedAvatar] });

      // @ts-ignore
      expect(block.children.avatar["props"]["src"]).toContain("some.img");
    });

    it("chat title property changed", () => {
      const updatedTitle = {
        ...chat,
        title: "new title",
      };

      // @ts-ignore
      saveCallback.action({ chats: [updatedTitle] });

      expect(
        block.element()?.querySelector(chatTitleClassName)?.textContent,
      ).toBe(updatedTitle.title);
    });
  });
});
