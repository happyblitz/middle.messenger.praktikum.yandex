import Block from "../../core/Block";
import Input from "../../components/input-field";
import Button from "../../components/button";
import InputError from "../../components/input-error";
import hbs from "./template.hbs?raw";

class LoginPage extends Block<{}> {
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

    const formError = new InputError();

    this.children = {
      loginInput,
      passwordInput,
      submitButton,
      formError,
    };

    this.events = {
      input: (event) => {
        const loginField = this.children.loginInput.getRef(
          "input",
        ) as HTMLInputElement;
        const passwordField = this.children.passwordInput.getRef(
          "input",
        ) as HTMLInputElement;
        const submitButton = this.children.submitButton.getRef(
          "button",
        ) as HTMLButtonElement;

        if (event.target === loginField || event.target === passwordField) {
          const disabled = !Boolean(
            loginField.value.trim() && passwordField.value.trim(),
          );

          submitButton.disabled = disabled;
        }
      },
    };
  }
}

export default LoginPage;
