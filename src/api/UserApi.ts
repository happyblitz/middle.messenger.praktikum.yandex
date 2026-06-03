import Api from "./API";

class UserApi extends Api {
  constructor() {
    super("/user");
  }

  profile(data: Record<string, string>) {
    return this.put("/profile", { data });
  }

  profileAvatar(formData: FormData) {
    return this.put("/profile/avatar", { data: formData });
  }

  password(data: Record<string, string>) {
    return this.put("/password", { data });
  }

  // search() {
  //   return this.post("/search");
  // }
}

const userApi = new UserApi();

export default userApi;
