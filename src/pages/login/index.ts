import FormBlock from "../../core/FormBlock";
import Input from "../../components/input-field";
import Button from "../../components/button";
import InputError from "../../components/input-error";
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

    const formError = new InputError();

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
          const formdata = new FormData(form);

          console.log("formdata => ", formdata);
          formdata.forEach((value, key) => {
            console.log(`Поле: ${key}, значение ${value}`);
          });
        }
      },
    };
  }
}

export default LoginPage;
