import type { User } from "../core/Store";
import type { Chat } from "../core/Store";
import type { UploadFile } from "../core/Store";

const BASE_RESOURES_URL = "https://ya-praktikum.tech/api/v2/resources";

export function getDisplayName(user: Partial<User> = {}): string {
  if ("id" in user) {
    return user?.display_name || `${user.first_name} ${user.second_name}`;
  }

  return "Некто";
}

export function getUserAvatar(user: Partial<User> = {}): string {
  if ("avatar" in user) {
    return BASE_RESOURES_URL + user.avatar;
  }

  return "/images/avatar.png";
}

export function getChannelAvatar(chat: Chat): string {
  return chat.avatar
    ? BASE_RESOURES_URL + chat.avatar
    : "/images/channelAvatar.png";
}

export function getFileUrl(file: Partial<UploadFile> = {}): string {
  if ("path" in file) {
    return BASE_RESOURES_URL + file.path;
  } else {
    return "";
  }
}

export const cssHideClassName = "visually-hidden";
export const cssModalClosedClass = "modal-closed";
export const fixedModalClass = "fixed-box";

// конвертируем картинку в формат base64
export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Если файла нет, сразу возвращаем пустую строку
    if (!file.name) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// задержка
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
