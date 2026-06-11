import Controller from "../core/Controller";
import store from "../core/Store";
import userApi from "../api/UserApi";

class UserController extends Controller {
  public changeProfile(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.form.profile.fields", errors);
      return;
    }

    //отправляем данные
    this.changeProfileRequest(data);
  }

  protected async changeProfileRequest(data: Record<string, string>) {
    const response = await userApi.profile(data);

    if (response?.reason) {
      store.setStateByPath("errors.form.profile.form", response.reason);
      return;
    }

    store.setState({
      user: response,
    });
  }

  public changePassword(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.form.changePassword.fields", errors);
      return;
    }

    //отправляем данные
    this.changePasswordRequest(data);
  }

  protected async changePasswordRequest(data: Record<string, string>) {
    const response = await userApi.password(data);

    if (response?.reason) {
      store.setStateByPath("errors.form.changePassword.form", response.reason);
      return;
    }

    store.setStateByPath("response.form.changePassword", response);
  }

  public changeAvatar(formData: FormData) {
    const { errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      const error = Object.values(errors).join(". ");
      store.setStateByPath("errors.form.avatar.form", error);
      return;
    }

    //отправляем данные
    this.changeAvatarRequest(formData);
  }

  protected async changeAvatarRequest(data: FormData) {
    const response = await userApi.profileAvatar(data);

    if (response?.reason) {
      store.setStateByPath("errors.form.avatar.form", response.reason);
      return;
    }

    store.setState({
      user: response,
    });
  }

  public async userSearch(requestId: number, input: string) {
    const newInput = input.trim();

    let usersList: Record<string, unknown>[] = [];

    if (newInput) {
      const data = { login: input.trim() };
      const response = await userApi.search(data);

      if (Array.isArray(response)) {
        usersList = response;
      }
    }

    store.setStateByPath("data.userSearch", { requestId, users: usersList });
  }
}

export default UserController;
