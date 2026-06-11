import API_SETTINGS from "../scripts/api.settings";
import HTTPTransport from "../core/HTTPTransport";
import type { HTTPTransportOptions } from "../core/HTTPTransport";
import type { HTTPRequestRejected } from "../core/HTTPTransport";

abstract class Api {
  protected endpoint: string;
  protected transport: HTTPTransport;

  protected constructor(resource: string) {
    this.endpoint = API_SETTINGS.baseUrl + resource;
    this.transport = new HTTPTransport(this.endpoint);
  }

  protected async post(
    path: string = "",
    options: HTTPTransportOptions = {},
  ): Promise<Record<string, unknown>> {
    try {
      return (await this.transport.post(path, options)) as Record<
        string,
        unknown
      >;
    } catch (e) {
      return e as HTTPRequestRejected;
    }
  }

  protected async put(
    path: string = "",
    options: HTTPTransportOptions = {},
  ): Promise<Record<string, unknown>> {
    try {
      return (await this.transport.put(path, options)) as Record<
        string,
        unknown
      >;
    } catch (e) {
      return e as HTTPRequestRejected;
    }
  }

  protected async delete(
    path: string = "",
    options: HTTPTransportOptions = {},
  ): Promise<Record<string, unknown>> {
    try {
      return (await this.transport.delete(path, options)) as Record<
        string,
        unknown
      >;
    } catch (e) {
      return e as HTTPRequestRejected;
    }
  }

  protected async get(path: string = ""): Promise<Record<string, unknown>> {
    try {
      return (await this.transport.get(path)) as Record<string, unknown>;
    } catch (e) {
      return e as HTTPRequestRejected;
    }
  }
}

export default Api;
