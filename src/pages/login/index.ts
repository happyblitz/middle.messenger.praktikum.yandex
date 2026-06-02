import FormBlock from "../../core/FormBlock";
import AuthController from "../../controllers/AuthController";
import store from "../../core/Store";
import Input from "../../components/input-field";
import Button from "../../components/button";
import InfoMessage from "../../components/info-message";
import { isEventInForm } from "../../utils/Dom";
import hbs from "./template.hbs?raw";

class LoginPage extends FormBlock<object> {
  template = hbs;

  constructor() {
    super({ sign_up: "/register" });

    const loginInput = new Input({
      name: "login",
      placeholder: "ваш логин",
      autocomplete: "username",
    });

    const passwordInput = new Input({
      type: "password",
      name: "password",
      placeholder: "ваш пароль",
      autocomplete: "current-password",
    });

    const submitButton = new Button({
      type: "submit",
      text: "Авторизоваться",
      className: ["button-primary", "colored-border"],
      disabled: true,
    });

    const formError = new InfoMessage();

    this.children = {
      loginInput,
      passwordInput,
      submitButton,
      formError,
    };

    this.events = {
      input: (event) => {
        const form = this.getRef("form");
        if (isEventInForm(event, form)) {
          const submitButton = this.children.submitButton.getRef(
            "button",
          ) as HTMLButtonElement;

          submitButton.disabled = !this.syncInputsState({ setProps: false });
        }
      },
      submit: (event) => {
        const form = this.getRef("form");
        if (isEventInForm(event, form)) {
          event.preventDefault();

          const formIsValid = this.syncInputsState();

          if (!formIsValid) {
            return;
          }

          const form = this.getRef("form") as HTMLFormElement;
          const formData = new FormData(form);

          if (this.controller instanceof AuthController) {
            this.controller.login(formData);
          }
        }
      },
    };
  }

  protected componentDidMount(): void {
    this.controller = new AuthController();

    const unsibscribe = store.subscribe({
      action: (state) => {
        // общая ошибка (в основном от апи)
        if (state.errors?.formLogin?.form) {
          this.children.formError.setProps({
            text: state.errors.formLogin.form,
            error: true,
          });
        }

        // ошибки валидации полей
        if (state.errors?.formLogin?.fields) {
          const errors = state.errors.formLogin.fields;
          this.inputsSetErrors(errors);
        }
      },
      observer: (state) => [
        state.errors?.formLogin?.form,
        state.errors?.formLogin?.fields,
      ],
    });

    this.unsubscribers.push(unsibscribe);
  }
}

export default LoginPage;
