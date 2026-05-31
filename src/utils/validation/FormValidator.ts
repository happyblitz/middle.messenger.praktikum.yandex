import validateField from "./Validator";

class FormValidator {
  static validateInput(name: string, value: string, strict = true): string {
    const trimValue = value.trim();

    if (!trimValue && !strict) {
      return "";
    }

    return validateField(name, trimValue) || "";
  }

  static validateConPassField(
    passValue: string,
    conPassValue: string,
    strict = true,
  ) {
    const trimPassValue = passValue.trim();
    const trimConPassValue = conPassValue.trim();

    if (strict || trimConPassValue) {
      return trimPassValue === trimConPassValue ? "" : "Пароли не совпадают";
    }

    return "";
  }
}

export default FormValidator;
