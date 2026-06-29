import { describe, expect, it } from "vitest";
import UsersListSelected from ".";
import { testUser } from "../../../fixtures/user";

describe("Компонент UsersListSelected", () => {
  const selectedUsers = [testUser(), testUser()];
  const block = new UsersListSelected({ selectedUsers });

  describe("Проверка передачи свойств", () => {
    it("usersList", () => {
      expect(block.element()?.querySelectorAll("button").length).toBe(
        selectedUsers.length,
      );
    });
  });
});
