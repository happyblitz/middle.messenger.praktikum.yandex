import Controller from "../core/Controller";
import store from "../core/Store";
import validateField from "../utils/validation/Validator";
import FormValidator from "../utils/validation/FormValidator";

class AuthController extends Controller {
  public newUser(formData: FormData) {
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
    if (passwordConfirm !== undefined) {
      const errorText = FormValidator.validateConPassField(
        data["password"],
        passwordConfirm as string,
      );

      if (errorText) {
        errors["password-confirm"] = errorText;
      }
    }

    if (errors) {
      // ошибки валидации формы, отправляем напрямую в стор
      store.setStateByPath("errors.formRegister.fields", errors);
      return;
    }

    //@TODO вызвать AuthApi c данными
    store.setStateByPath("errors.formRegister.form", "Некоторая ошибка");
  }
}

export default AuthController;
