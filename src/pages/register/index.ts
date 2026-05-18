import Block from "../../core/Block";
import type { SyncInputsArgs } from "../../core/Block";
import Input from "../../components/input-field";
import Button from "../../components/button";
import FormValidator from "../../utils/FormValidator";
import { isEventInForm, isSubmitRelatedTarget } from "../../utils/Dom";
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
      autocomplete: "off",
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
      focusout: (event: Event) => {
        const form = this.getRef("form");
        if (isEventInForm(event, form)) {
          const input = event.target as HTMLInputElement;

          // Фокус перешёл на кнопку submit текущей формы
          // Проверкой займется submit формы
          if (isSubmitRelatedTarget(event as FocusEvent, form)) {
            return;
          }

          this.syncInputsState({ inputName: input.name, strict: false });
        }
      },
      input: (event: Event) => {
        const form = this.getRef("form");
        if (isEventInForm(event, form)) {
          const submitButton = this.children.submitButton.getRef(
            "button",
          ) as HTMLButtonElement;

          submitButton.disabled = !this.syncInputsState({ setProps: false });
        }
      },
      submit: (event: Event) => {
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

  protected syncInputsState(args: SyncInputsArgs = {}): boolean {
    const { setProps = true, inputName = "", strict = true } = args;

    // проверка полей, для которых указано regexp
    let isValid = super.syncInputsState({ setProps, inputName, strict });

    // требуется ли валидация поля password-confirm
    const shouldValidateConPassInput =
      !inputName || ["password", "password-confirm"].includes(inputName);

    // проверка поля password-confirm
    if (shouldValidateConPassInput) {
      const passInput = this.children.passwordInput.getRef(
        "input",
      ) as HTMLInputElement;
      const conPassInput = this.children.confirmPasswordInput.getRef(
        "input",
      ) as HTMLInputElement;

      const errorText = FormValidator.validateConPassField(
        passInput.value,
        conPassInput.value,
        strict,
      );

      if (errorText) {
        isValid = false;
      }

      if (setProps) {
        this.children.confirmPasswordInput.setProps({
          errorText,
          value: conPassInput.value,
        });
      }
    }

    return isValid;
  }
}

export default RegisterPage;
