import { describe, expect, it } from "vitest";
import Avatar from ".";

describe("Компонент Аватар", () => {
  describe("Проверка передачи свойств", () => {
    const block = new Avatar({
      src: "/avatar",
      alt: "description",
      width: 100,
      height: 70,
      className: ["img1"],
    });

    const element = block.element();

    it("src", () => {
      expect(element?.getAttribute("src")).toBe("/avatar");
    });
    it("alt", () => {
      expect(element?.getAttribute("alt")).toBe("description");
    });
    it("width", () => {
      expect(element?.getAttribute("width")).toBe("100");
    });
    it("height", () => {
      expect(element?.getAttribute("height")).toBe("70");
    });
    it("html classes", () => {
      expect(element?.classList.contains("img1")).toBe(true);
    });
  });
});
