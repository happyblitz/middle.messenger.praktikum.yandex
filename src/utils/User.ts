import type { User } from "../core/Store";

export function getDisplayName(user: User): string {
  return user.display_name || user.login;
}

export function getUserAvatar(user: User): string {
  return user.avatar || "/images/avatar.png";
}
