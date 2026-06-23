import { describe, expect, it, vi } from "vitest";
import LoginPage from ".";

vi.mock("../../controllers/AuthController", () => {
  class MockAuthController {
    login() {}
  }

  return { default: MockAuthController };
});

describe("Компонент LoginPage", () => {
  describe("Проверка передачи свойств", () => {
    const block = new LoginPage();

    it("code", () => {
      expect(block.element()?.querySelectorAll("input")?.length).toBe(2);
    });
  });
});
