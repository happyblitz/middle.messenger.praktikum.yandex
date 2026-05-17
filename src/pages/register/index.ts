import Block from "../../core/Block";
import Input from "../../components/input-field";
import Button from "../../components/button";
import hbs from "./template.hbs?raw";

class RegisterPage extends Block<object> {
  template = hbs;

  constructor() {
    super({ sign_in: "/login" });

    const emailInput = new Input({
      type: "email",
      name: "email",
      placeholder: "Почта",
      autocomplete: "email",
    });

    const loginInput = new Input({
      name: "login",
      placeholder: "ваш логин",
      autocomplete: "username",
    });

    const firstNameInput = new Input({
      name: "first_name",
      placeholder: "Имя",
      autocomplete: "name",
    });

    const secondNameInput = new Input({
      name: "second_name",
      placeholder: "Фамилия",
      autocomplete: "surname",
    });

    const phoneInput = new Input({
      type: "tel",
      name: "phone",
      placeholder: "Номер телефона",
      autocomplete: "tel",
    });

    const passwordInput = new Input({
      type: "password",
      name: "password",
      placeholder: "Пароль",
      autocomplete: "new-password",
    });

    const confirmPasswordInput = new Input({
      type: "password",
      name: "password-confirm",
      placeholder: "Пароль",
      autocomplete: "new-password",
    });

    const submitButton = new Button({
      type: "submit",
      text: "Зарегистрироваться",
      className: ["button-primary", "colored-border"],
      disabled: true,
    });

    this.children = {
      emailInput,
      loginInput,
      firstNameInput,
      secondNameInput,
      phoneInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
    };

    this.events = {
      input: () => {
        const reqFields: HTMLInputElement[] = Object.values(
          this.children,
        ).reduce((acc: HTMLInputElement[], element) => {
          const ref = element.getRef("input") as HTMLInputElement;
          if (ref) {
            acc.push(ref);
          }
          return acc;
        }, []);

        const submitButton = this.children.submitButton.getRef(
          "button",
        ) as HTMLButtonElement;

        submitButton.disabled = !reqFields.every((v) => v.value.trim());
      },
    };
  }
}

export default RegisterPage;
