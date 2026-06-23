import { describe, expect, it, vi } from "vitest";
import ProfileInfo from ".";
import { testUser } from "../../../fixtures/user";

vi.mock("../../../controllers/AuthController", () => {
  class MockAuthController {
    logout() {}
  }

  return { default: MockAuthController };
});

describe("Компонент ProfileInfo", () => {
  const user = testUser({ email: "test@test.test" });

  describe("Проверка отображения", () => {
    const block = new ProfileInfo({
      user,
      onEditProfile: vi.fn(),
      onChangePasswrod: vi.fn(),
    });

    const values: string[] = [];
    block
      .element()
      ?.querySelectorAll("dd")
      .forEach((d) => values.push(d.textContent));

    it("email", () => {
      expect(values.includes(user.email!)).toBe(true);
    });
    it("login", () => {
      expect(values.includes(user.login)).toBe(true);
    });
  });
});
