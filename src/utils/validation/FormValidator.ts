import validateField from "./Validator";

export type FormValidateArgs = {
  fieldName?: string;
  strict?: boolean;
};

type FormField = {
  type?: string;
  value: string;
};

export type FormFields = Record<string, FormField>;

class FormValidator {
  static confirmFieldName: Record<string, string> = {
    password_confirm: "password",
    newPassword_confirm: "newPassword",
  };

  static validateForm(
    fields: FormFields,
    params: FormValidateArgs,
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    // требуется валидировать только одно поле
    if (params.fieldName) {
      const errorText = this.validateFormField(
        params.fieldName,
        fields,
        params.strict,
      );
      if (errorText) {
        errors[params.fieldName] = errorText;
      }

      return errors;
    }

    // валидируются все поля
    for (const fieldName of Object.keys(fields)) {
      const errorText = this.validateFormField(
        fieldName,
        fields,
        params.strict,
      );
      if (errorText) {
        errors[fieldName] = errorText;
      }
    }

    return errors;
  }

  static validateFormField(
    fieldName: string,
    fields: FormFields,
    strict = true,
  ): string {
    // валиация поля подтверждения пароля
    if (fieldName in this.confirmFieldName) {
      const passwordName = this.confirmFieldName[fieldName];

      return this.validateConfirmField(
        fields[passwordName].value,
        fields[fieldName].value,
        strict,
      );
    }

    // валидация полей по регулярному выражению из списка
    return this.validateInput(fieldName, fields[fieldName].value, strict);
  }

  /**
   * валидация полей по регулярному выражению из списка
   * @param name
   * @param value
   * @param strict
   * @returns
   */
  static validateInput(name: string, value: string, strict = true): string {
    const trimValue = value.trim();

    if (!trimValue && !strict) {
      return "";
    }

    return validateField(name, trimValue) || "";
  }

  /**
   * Валидация поля подтверждения пароля
   * @param password Пароль
   * @param confirm Повторный ввод пароля
   * @param strict Валидировать пустое поле или нет
   * @returns
   */
  static validateConfirmField(
    password: string,
    confirm: string,
    strict = true,
  ): string {
    const passwordValue = password.trim();
    const confirmValue = confirm.trim();

    if (strict || confirmValue) {
      return passwordValue === confirmValue ? "" : "Пароли не совпадают";
    }

    return "";
  }

  /**
   * Проверяет что все поля формы пустые
   */
  static allFieldsFilled(fields: Record<string, string>) {
    return Object.entries(fields).every(([, value]) => value.trim() !== "");
  }
}

export default FormValidator;
