import { describe, expect, it, vi } from "vitest";
import ProfileEditFields from ".";
import { testUser } from "../../../fixtures/user";

vi.mock("../../../controllers/UserController", () => {
  class MockAuthController {
    changeAvatar() {}
    changeProfile() {}
  }

  return { default: MockAuthController };
});

vi.mock("../../../core/Store", () => ({
  default: {
    subscribe: () => 1,
  },
}));

describe("Компонент ProfileEditFields", () => {
  const user = testUser();

  describe("Проверка отображения", () => {
    const block = new ProfileEditFields({
      user,
    });

    it("forms", () => {
      expect(block.element()?.querySelectorAll("form")?.length).toBe(2);
    });
  });
});
