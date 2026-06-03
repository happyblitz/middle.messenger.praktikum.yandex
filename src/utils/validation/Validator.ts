const AVATAR_EXT = ["JPEG", "JPG", "PNG", "GIF", "WebP"];
const avatarExtLower = AVATAR_EXT.map((value) => value.toLowerCase());
export const accept = AVATAR_EXT.map((value) => "." + value.toLowerCase()).join(
  ", ",
);

const VALIDATION_RULES = {
  first_name: {
    validator: /^[A-ZА-ЯЙЁ][a-zа-яёй]+((-[A-ZА-ЯЙЁ])?[a-zа-яёй]+)*$/,
    error: `Латиница или кириллица, первая буква заглавная.
Без пробелов и цифр, из спецсимволов — только дефис.`,
  },
  second_name: {
    validator: /^[A-ZА-ЯЙЁ][a-zа-яёй]+((-[A-ZА-ЯЙЁ])?[a-zа-яёй]+)*$/,
    error: `Латиница или кириллица, первая буква заглавная.
Без пробелов и цифр, из спецсимволов — только дефис.`,
  },
  login: {
    validator: /^(?=.*[A-Za-z])[0-9A-Za-z-_]{3,20}$/,
    error: `3–20 символов, латиница. Может содержать цифры, но не состоит только из них.
Без пробелов, допустимы дефис и подчёркивание.`,
  },
  email: {
    validator:
      /^[0-9A-Za-z]+([-_+.][0-9A-Za-z]+)*@[0-9A-Za-z]+(-[0-9A-Za-z]+)*\.[A-Za-z]{2,}$/,
    error: `Латиница, цифры и спецсимволы. Обязательны @ и точка после него.
Между @ и точкой должны быть буквы.`,
  },
  oldPassword: {
    validator: /\S/,
    error: "Введите ваш текущий пароль",
  },
  password: {
    validator: /^(?=.*[0-9])(?=.*[A-ZА-Я])\S{8,40}$/,
    error: "8–40 символов, минимум одна заглавная буква и одна цифра.",
  },
  newPassword: {
    validator: /^(?=.*[0-9])(?=.*[A-ZА-Я])\S{8,40}$/,
    error: "8–40 символов, минимум одна заглавная буква и одна цифра.",
  },
  phone: {
    validator: /^\+?[0-9]{10,15}$/,
    error: "10–15 символов, цифры, может начинаться с плюса",
  },
  message: {
    validator: /\S/,
    error: "не должно быть пустым",
  },
  avatar: {
    validator: (fileName: string) => {
      const ext = fileName.split(".").at(-1) ?? "";
      return avatarExtLower.includes(ext.toLowerCase());
    },
    error: "Допустимые расширения файлов: " + AVATAR_EXT.join(", "),
  },
} as const;

const validateField = (fieldName: string, value: string) => {
  if (!(fieldName in VALIDATION_RULES)) return null;

  const rule = VALIDATION_RULES[fieldName as keyof typeof VALIDATION_RULES];
  const type = rule.validator.constructor.name;

  let isValid;
  if (type === "RegExp") {
    isValid = (rule.validator as RegExp).test(value);
  } else if (type === "Function") {
    isValid = (rule.validator as Function)(value);
  } else {
    isValid = true;
  }

  return isValid
    ? null
    : VALIDATION_RULES[fieldName as keyof typeof VALIDATION_RULES].error;
};

export default validateField;
