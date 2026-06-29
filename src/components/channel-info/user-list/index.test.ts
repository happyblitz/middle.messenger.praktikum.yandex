import { describe, expect, it } from "vitest";
import UsersList from ".";
import { testUser } from "../../../fixtures/user";

describe("Компонент UsersList", () => {
  const users = [testUser()];

  const block = new UsersList({
    usersList: users,
  });

  describe("Проверка передачи свойств", () => {
    it("usersList", () => {
      expect(block.element()?.querySelectorAll("li").length).toBe(users.length);
    });
  });
});
