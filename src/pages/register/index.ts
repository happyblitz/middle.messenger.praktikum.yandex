import FormBlock from "../../core/FormBlock";
import AuthController from "../../controllers/AuthController";
import store from "../../core/Store";
import type { SyncInputsArgs } from "../../core/FormBlock";
import Input from "../../components/input-field";
import InfoMessage from "../../components/info-message";
import Button from "../../components/button";
import FormValidator from "../../utils/validation/FormValidator";
import { isEventInForm, isSubmitRelatedTarget } from "../../utils/Dom";
import hbs from "./template.hbs?raw";

class RegisterPage extends FormBlock<object> {
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
      placeholder: "Пароль еще раз",
      autocomplete: "off",
    });

    const formError = new InfoMessage();

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
      formError,
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
          const disabled = !this.syncInputsState({ setProps: false });
          this.submitBtnDisabled(disabled);
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

          this.submitBtnDisabled(true);

          const form = this.getRef("form") as HTMLFormElement;
          const formData = new FormData(form);

          if (this.controller instanceof AuthController) {
            this.controller.newUser(formData);
          }
        }
      },
    };
  }

  protected submitBtnDisabled(isDisabled: boolean): void {
    const submitButton = this.children.submitButton.getRef(
      "button",
    ) as HTMLButtonElement;

    if (submitButton) {
      submitButton.disabled = isDisabled;
    }
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

  protected componentDidMount(): void {
    this.controller = new AuthController();

    const unsibscribe = store.subscribe({
      action: (state) => {
        // общая ошибка (в основном от апи)
        if (state.errors?.formRegister?.form) {
          this.children.formError.setProps({
            text: state.errors.formRegister.form,
            error: true,
          });
        }

        // ошибки валидации полей
        if (state.errors?.formRegister?.fields) {
          const errors = state.errors.formRegister.fields;
          this.inputsSetErrors(errors);
        }
      },
      observer: (state) => [
        state.errors?.formRegister?.form,
        state.errors?.formRegister?.fields,
      ],
    });

    this.unsubscribers.push(unsibscribe);
  }
}

export default RegisterPage;
