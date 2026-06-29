import FormBlock from "../../../core/FormBlock";
import Button from "../../../components/button";
import Input from "../../../components/input-field";
import Avatar from "../../../components/avatar";
import type { User } from "../../../core/Store";
import { isSubmitRelatedTarget } from "../../../utils/Dom";
import hbs from "./template.hbs?raw";
import InfoMessage from "../../../components/info-message";
import UserController from "../../../controllers/UserController";
import store from "../../../core/Store";
import { getUserAvatar, getDisplayName } from "../../../utils/Globals";

type ProfileChangePasswordProps = {
  user: User;
  displayName?: string;
};

class ProfileChangePassword extends FormBlock<ProfileChangePasswordProps> {
  template = hbs;

  constructor(props: ProfileChangePasswordProps) {
    super(props);

    const avatar = new Avatar({
      src: getUserAvatar(this.props.user),
      className: ["profile__avatar"],
    });

    const oldPassInput = new Input({
      type: "password",
      name: "oldPassword",
      label: "Текущий пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "password",
    });

    const passwordInput = new Input({
      type: "password",
      name: "newPassword",
      label: "Новый пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "newPassword",
    });

    const confirmPasswordInput = new Input({
      type: "password",
      name: "newPassword_confirm",
      label: "Повторите новый пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "newPassword_confirm",
    });

    const formInfo = new InfoMessage();

    const saveButton = new Button({
      type: "submit",
      text: "Сохранить",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatar,
      oldPassInput,
      passwordInput,
      confirmPasswordInput,
      formInfo,
      saveButton,
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
      submit: (event: Event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          const formIsValid = this.formValidate();
          if (!formIsValid) {
            return;
          }

          this.children.saveButton.setProps({ disabled: true });

          if (this.controller instanceof UserController) {
            const formData = this.getFormData();
            this.controller.changePassword(formData);
          }
        }
      },
    };
  }

  protected beforeCompile(): void {
    this.props.displayName = getDisplayName(this.props.user);
  }

  protected componentDidMount(): void {
    this.children.saveButton.setProps({ disabled: false });

    this.controller = new UserController();

    this.formErrorListener({
      formKey: "changePassword",
      submitBtn: this.children.saveButton as Button,
      formInfo: this.children.formInfo as InfoMessage,
    });

    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          if (state.response?.form?.changePassword) {
            this.formSuccessMessage(this.children.formInfo as InfoMessage);
            store.setStateByPath("response.form.changePassword", null);
          }
        },
        observer: (state) => state.response?.form?.changePassword,
      }),
    );

    super.componentDidMount();
  }
}

export default ProfileChangePassword;
