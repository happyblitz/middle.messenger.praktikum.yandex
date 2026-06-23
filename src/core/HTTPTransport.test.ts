import { vi, it, describe, expect, beforeEach } from "vitest";
import HTTPTransport from "./HTTPTransport.ts";

let lastInstance: MockXMLHttpRequest;

class MockXMLHttpRequest {
  status: number = 0;
  responseText: string;
  constructor() {
    lastInstance = this;
  }
  async open() {}
  async send() {}
  async onload() {}
  setRequestHeader() {}
  getResponseHeader() {
    return ["application/json"];
  }
}

describe("HTTPTransport", () => {
  vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
  const baseUrl = "https://testBaseUrl.test";
  let transport: HTTPTransport;

  beforeEach(() => {
    transport = new HTTPTransport(baseUrl);
  });

  const url = "/call";
  const data = { param: 1 };

  describe("Get запрос", () => {
    it("Проверка вызова верного URL", () => {
      const spy = vi.spyOn(XMLHttpRequest.prototype, "open");
      transport.get(url, { data });
      expect(spy).toHaveBeenLastCalledWith("GET", baseUrl + url + `?param=1`);
    });

    it("Проверка вызова send без данных", () => {
      const spy = vi.spyOn(XMLHttpRequest.prototype, "send");
      transport.get(url, { data });
      expect(spy).toHaveBeenLastCalledWith();
    });
  });

  describe("Post запрос", () => {
    it("Проверка Content-Type: application/json", () => {
      const spy = vi.spyOn(XMLHttpRequest.prototype, "setRequestHeader");
      transport.post("", { data });
      expect(spy).toHaveBeenLastCalledWith("Content-Type", "application/json");
    });

    it("Проверка вызова send с данными", () => {
      const spy = vi.spyOn(XMLHttpRequest.prototype, "send");
      transport.post(url, { data });
      expect(spy).toHaveBeenLastCalledWith(JSON.stringify(data));
    });
  });

  describe("Ответ сервиса", async () => {
    it("Статус 200", async () => {
      const promise = transport.post("", { data });
      lastInstance.status = 200;
      lastInstance.responseText = JSON.stringify(data);
      lastInstance.onload();
      const response = await promise;
      expect(response).toEqual(data);
    });

    it("Статус 403", async () => {
      const mockResponse = { reason: "test case" };
      const promise = transport.post("", { data });
      lastInstance.status = 403;
      lastInstance.responseText = JSON.stringify(mockResponse);
      lastInstance.onload();

      let error;

      try {
        await promise;
      } catch (e) {
        error = e;
      }

      expect((error as Record<string, unknown>).reason).toBe(
        mockResponse.reason,
      );
    });
  });
});
