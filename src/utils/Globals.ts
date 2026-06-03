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

// получить название файла
export const getFileName = (path: string): string => {
  return path.split("/").at(-1) ?? "";
};
