import type { User } from "../core/Store";

let id = 1;

export const testUser = (options: Partial<User> = {}) => {
  const user: User = {
    id: id,
    first_name: "Test",
    second_name: "Yest",
    avatar: null,
    display_name: null,
    login: "test" + id,
    ...options,
  };

  id++;

  return user;
};
