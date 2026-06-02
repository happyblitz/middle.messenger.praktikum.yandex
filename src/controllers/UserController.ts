import FormController from "../core/FormController";
import store from "../core/Store";
import userApi from "../api/UserApi";

class UserController extends FormController {
  public changeProfile(formData: FormData) {
    const { data, errors } = this.formValidate(formData);

    if (Object.keys(errors).length) {
      // ошибки валидации полей формы отправляем напрямую в стор
      store.setStateByPath("errors.formProfile.fields", errors);
      return;
    }

    //отправляем данные
    this.changeProfileRequest(data);
  }

  protected async changeProfileRequest(data: Record<string, string>) {
    const response = await userApi.profile(data);

    console.log("profile", response);

    if (response?.reason) {
      store.setStateByPath("errors.formProfile.form", response.reason);
      return;
    }

    store.setState({
      user: response,
    });
  }
}

export default UserController;
