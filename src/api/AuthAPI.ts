import API_SETTINGS from "../scripts/api.settings";
import HTTPTransport from "../core/HTTPTransport";

class AuthApi {
  private transport: HTTPTransport;

  constructor() {
    const endpoint = API_SETTINGS.baseUrl + "/auth";
    this.transport = new HTTPTransport(endpoint);
  }

  public singUp(data: Record<string, string>): void {
    this.transport
      .post("/signup", { data })
      .then((response) => console.log(response))
      .catch((e) => console.log(e));
  }
}

export default AuthApi;
