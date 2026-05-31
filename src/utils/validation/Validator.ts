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
  old_password: {
    validator: /\S/,
    error: "Введите ваш текущий пароль",
  },
  password: {
    validator: /^(?=.*[0-9])(?=.*[A-ZА-Я])\S{8,40}$/,
    error: "8–40 символов, минимум одна заглавная буква и одна цифра.",
  },
  new_password: {
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
} as const;

const validateField = (fieldName: string, value: string) => {
  if (!(fieldName in VALIDATION_RULES)) return null;

  return VALIDATION_RULES[
    fieldName as keyof typeof VALIDATION_RULES
  ].validator.test(value)
    ? null
    : VALIDATION_RULES[fieldName as keyof typeof VALIDATION_RULES].error;
};

export default validateField;
