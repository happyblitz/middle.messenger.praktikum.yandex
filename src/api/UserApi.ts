import user from "./static-data/profile_fields_static";
import type { User } from "./static-data/profile_fields_static";

class UserApi {
  public static async getCurrentUser(): Promise<User> {
    return user;
  }
}

export default UserApi;
