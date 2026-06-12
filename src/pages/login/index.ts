import FormBlock from "../../core/FormBlock";
import AuthController from "../../controllers/AuthController";
import Input from "../../components/input-field";
import Button from "../../components/button";
import InfoMessage from "../../components/info-message";
import hbs from "./template.hbs?raw";

class LoginPage extends FormBlock<object> {
  template = hbs;

  constructor() {
    super({ sign_up: "/sign-up" });

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
        if (this.isFormEvent(event)) {
          // проверяем только заполненность всех полей
          const disabled = !this.allFieldsFilled();
          this.children.submitButton.setProps({ disabled });
        }
      },
      submit: (event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          this.children.submitButton.setProps({ disabled: true });

          if (this.controller instanceof AuthController) {
            const formData = this.getFormData();
            this.controller.login(formData);
          }
        }
      },
    };
  }

  protected componentDidMount(): void {
    super.componentDidMount();
    this.controller = new AuthController();
    this.formErrorListener({
      formKey: "login",
      submitBtn: this.children.submitButton as Button,
      formInfo: this.children.formError as InfoMessage,
    });
  }
}

export default LoginPage;
