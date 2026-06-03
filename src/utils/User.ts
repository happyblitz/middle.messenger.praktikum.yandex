import type { User } from "../core/Store";

const BASE_RESOURES_URL = "https://ya-praktikum.tech/api/v2/resources";

export function getDisplayName(user: User): string {
  return user.display_name || user.login;
}

export function getUserAvatar(user: User): string {
  return BASE_RESOURES_URL + user.avatar || "/images/avatar.png";
}
