import { describe, expect, it, vi } from "vitest";
import RegisterPage from ".";

vi.mock("../../controllers/AuthController", () => {
  class MockAuthController {
    newUser() {}
  }

  return { default: MockAuthController };
});

describe("Компонент RegisterPage", () => {
  describe("Проверка передачи свойств", () => {
    const block = new RegisterPage();

    it("code", () => {
      expect(block.element()?.querySelectorAll("input")?.length).toBe(7);
    });
  });
});
