import FormValidator from "../utils/validation/FormValidator";
import validateField from "../utils/validation/Validator";

import Controller from "./Controller";

class FormController extends Controller {
  /**
   * Валидирует форму
   * @param formData
   * @returns Возвращает объект с данными формы и ошибками
   */
  protected formValidate(formData: FormData) {
    // преобразование и валидация данных
    const data: Record<string, string> = {};
    const errors: Record<string, string> = {};

    formData.forEach((value, fieldName) => {
      const fieldValue = (value as string).trim();
      const fieldError = validateField(fieldName, fieldValue);

      if (fieldError) {
        errors[fieldName] = fieldError;
      }

      data[fieldName] = fieldValue;
    });

    // validate "password-confirm" field
    const passwordConfirm = formData.get("password-confirm");
    if (passwordConfirm !== null) {
      const errorText = FormValidator.validateConfirmField(
        data["password"],
        passwordConfirm as string,
      );

      if (errorText) {
        errors["password-confirm"] = errorText;
      }
    }

    return { data, errors };
  }
}

export default FormController;
