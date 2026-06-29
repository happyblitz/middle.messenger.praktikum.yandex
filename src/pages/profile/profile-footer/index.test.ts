import { describe, expect, it, vi } from "vitest";
import ProfileFooter from ".";

vi.mock("../../../core/Store", () => ({
  default: {
    subscribe: () => 1,
  },
}));

describe("Компонент ProfileFooter", () => {
  describe("Проверка отображения", () => {
    const block = new ProfileFooter({
      onDeepClose: vi.fn(),
    });

    it("close btn", () => {
      expect(block.element()?.textContent.length).toBeGreaterThan(0);
    });
  });
});
