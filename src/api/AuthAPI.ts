import API_SETTINGS from "../scripts/api.settings";
import HTTPTransport from "../core/HTTPTransport";
import type { HTTPRequestRejected } from "../core/HTTPTransport";

class AuthApi {
  private static endpoint = API_SETTINGS.baseUrl + "/auth";
  private static transport = new HTTPTransport(AuthApi.endpoint);

  public static async singUp(
    data: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    try {
      return (await this.transport.post("/signup", { data })) as Record<
        string,
        unknown
      >;
    } catch (e) {
      return e as HTTPRequestRejected;
    }
  }
}

export default AuthApi;
