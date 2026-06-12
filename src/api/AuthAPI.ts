import Api from "./API";

class AuthApi extends Api {
  constructor() {
    super("/auth");
  }

  signUp(data: Record<string, string>) {
    return this.post("/signup", { data });
  }

  signIn(data: Record<string, string>) {
    return this.post("/signin", { data });
  }

  user() {
    return this.get("/user");
  }

  logOut() {
    return this.post("/logout");
  }
}

const authApi = new AuthApi();

export default authApi;
