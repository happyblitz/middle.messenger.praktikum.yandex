import type { User } from "../core/Store";
import type { Chat } from "../core/Store";
import type { UploadFile } from "../core/Store";

const BASE_RESOURES_URL = "https://ya-praktikum.tech/api/v2/resources";

export function getDisplayName(user: Partial<User> = {}): string {
  if (user?.display_name) {
    return user.display_name;
  }

  const nameParts = [];

  if (user?.first_name) {
    nameParts.push(user.first_name);
  }

  if (user?.second_name) {
    nameParts.push(user.second_name);
  }

  if (nameParts.length > 0) {
    return nameParts.join(" ");
  }

  return "Некто";
}

export function getUserAvatar(user: Partial<User> = {}): string {
  return user?.avatar ? BASE_RESOURES_URL + user.avatar : "/images/avatar.png";
}

export function getChannelAvatar(chat: Chat): string {
  return chat?.avatar
    ? BASE_RESOURES_URL + chat.avatar
    : "/images/channelAvatar.png";
}

export function getFileUrl(file: Partial<UploadFile> = {}): string {
  return file?.path ? BASE_RESOURES_URL + file.path : "";
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
