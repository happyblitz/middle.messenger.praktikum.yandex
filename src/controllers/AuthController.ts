import Controller from "../core/Controller";
import store from "../core/Store";
import authApi from "../api/AuthAPI";
import ChatsController from "./ChatsController";
import FormValidator from "../utils/validation/FormValidator";

class AuthController extends Controller {
  public newUser(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.form.register.fields", errors);
      return;
    }

    //отправляем данные
    this.newUserRequest(data);
  }

  protected async newUserRequest(data: Record<string, string>) {
    const response = await authApi.signUp(data);

    if (response?.reason) {
      store.setStateByPath("errors.form.register.form", response.reason);
      return;
    }

    this.entryPoint();
  }

  public login(formData: FormData) {
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = this.fieldPrepair(value as string);
    });

    // для логина требуется только заполненность полей
    const isValidForm = FormValidator.allFieldsFilled(data);

    // Не все поля заполнены, форма не валидна
    if (!isValidForm) {
      store.setStateByPath(
        "errors.form.login.form",
        "Все поля должны быть заполнены",
      );
      return;
    }

    //отправляем данные
    this.loginRequest(data);
  }

  protected async loginRequest(data: Record<string, string>) {
    const response = await authApi.signIn(data);

    if (response?.reason) {
      store.setStateByPath("errors.form.login.form", response.reason);
      return;
    }

    this.entryPoint();
  }

  /**
   * Входная точка
   * загружаем пользователя в стор,
   * загружаем чаты пользователя в стор
   */
  public async entryPoint() {
    const success = await this.getUserRequest();
    if (success) {
      const chatsController = new ChatsController();
      chatsController.chats();
    }
  }

  protected async getUserRequest(): Promise<boolean> {
    const response = await authApi.user();

    if (response?.reason) {
      store.setState({
        isAuthorized: false,
        user: null,
        errors: { getUser: response.reason },
      });
      return false;
    }

    store.setState({
      isAuthorized: true,
      user: response,
    });

    return true;
  }

  public async logout() {
    const response = await authApi.logOut();

    if (response?.reason) {
      store.setStateByPath("errors.logout", response);
      return;
    }

    store.setState({
      isAuthorized: false,
      user: null,
    });
  }
}

export default AuthController;
