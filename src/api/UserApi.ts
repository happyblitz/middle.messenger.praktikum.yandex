import user from "./static-data/profile_fields_static";
import type { User } from "./static-data/profile_fields_static";
import { toBase64 } from "../utils/Globals";

class UserApi {
  public static async getCurrentUser(): Promise<User> {
    return user;
  }

  public static async changeAvatar(formdata: FormData): Promise<string> {
    const image = formdata.get("avatar") as File;
    return await toBase64(image);
  }
}

export default UserApi;
