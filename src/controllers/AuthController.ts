import FormController from "../core/FormController";
import store from "../core/Store";
import authApi from "../api/AuthAPI";
import ChatsController from "./ChatsController";

class AuthController extends FormController {
  public newUser(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.formRegister.fields", errors);
      return;
    }

    //отправляем данные
    this.newUserRequest(data);
  }

  protected async newUserRequest(data: Record<string, string>) {
    const response = await authApi.signUp(data);

    console.log("signUp", response);

    if (response?.reason) {
      store.setStateByPath("errors.formRegister.form", response.reason);
      return;
    }

    this.entryPoint();
  }

  public login(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.formLogin.fields", errors);
      return;
    }

    //отправляем данные
    this.loginRequest(data);
  }

  protected async loginRequest(data: Record<string, string>) {
    const response = await authApi.signIn(data);

    console.log("signIn", response);

    if (response?.reason) {
      store.setStateByPath("errors.formLogin.form", response.reason);
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

    console.log("user", response);

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
