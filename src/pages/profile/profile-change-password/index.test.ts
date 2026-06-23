import { describe, expect, it, vi } from "vitest";
import ProfileChangePassword from ".";
import { testUser } from "../../../fixtures/user";

vi.mock("../../../controllers/UserController", () => {
  class MockAuthController {
    changePassword() {}
  }

  return { default: MockAuthController };
});

vi.mock("../../../core/Store", () => ({
  default: {
    subscribe: () => 1,
  },
}));

describe("Компонент ProfileChangePassword", () => {
  const user = testUser();

  describe("Проверка отображения", () => {
    const block = new ProfileChangePassword({
      user,
    });

    it("inputs", () => {
      expect(block.element()?.querySelectorAll("input")?.length).toBe(3);
    });
  });
});
