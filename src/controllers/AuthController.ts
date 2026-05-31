import Controller from "../core/Controller";
import store from "../core/Store";
import validateField from "../utils/validation/Validator";
import FormValidator from "../utils/validation/FormValidator";
import AuthApi from "../api/AuthAPI";

class AuthController extends Controller {
  public newUser(formData: FormData) {
    const { data, errors } = this.newUserFormValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.formRegister.fields", errors);
      return;
    }

    //отправляем данные
    this.newUserRequest(data);
  }

  protected newUserFormValidate(formData: FormData) {
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

    return { data, errors };
  }

  protected async newUserRequest(data: Record<string, string>) {
    const response = await AuthApi.singUp(data);

    console.log(response);

    // ошибка
    if (response?.reason) {
      store.setStateByPath("errors.formRegister.form", response.reason);
      return;
    }

    store.setState({
      isAuthorized: true,
      user: { id: response.id },
    });
  }
}

export default AuthController;
