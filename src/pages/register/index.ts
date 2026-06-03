import FormBlock from "../../core/FormBlock";
import AuthController from "../../controllers/AuthController";
import Input from "../../components/input-field";
import InfoMessage from "../../components/info-message";
import Button from "../../components/button";
import { isSubmitRelatedTarget } from "../../utils/Dom";
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
      name: "password_confirm",
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
        if (this.isFormEvent(event)) {
          const input = event.target as HTMLInputElement;

          // Фокус перешёл на кнопку submit текущей формы
          // Проверкой займется submit формы
          if (isSubmitRelatedTarget(event as FocusEvent, this.getRef("form"))) {
            return;
          }

          this.formValidate({ fieldName: input.name, strict: false });
        }
      },
      input: (event: Event) => {
        if (this.isFormEvent(event)) {
          const disabled = !this.formValidate({ setError: false });
          this.children.submitButton.setProps({ disabled });
        }
      },
      submit: (event: Event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          const formIsValid = this.formValidate();
          if (!formIsValid) {
            return;
          }

          this.children.submitButton.setProps({ disabled: true });

          if (this.controller instanceof AuthController) {
            const formData = this.getFormData();
            this.controller.newUser(formData);
          }
        }
      },
    };
  }

  protected componentDidMount(): void {
    super.componentDidMount();
    this.controller = new AuthController();
    this.formErrorListener({
      formKey: "register",
      submitBtn: this.children.submitButton as Button,
      formInfo: this.children.formError as InfoMessage,
    });
  }
}

export default RegisterPage;
