import FormBlock from "../../../core/FormBlock";
import Button from "../../../components/button";
import Input from "../../../components/input-field";
import InfoMessage from "../../../components/info-message";
import Avatar from "../../../components/avatar";
import type { User } from "../../../core/Store";
import { isSubmitRelatedTarget } from "../../../utils/Dom";
import hbs from "./template.hbs?raw";
import UserController from "../../../controllers/UserController";
import store from "../../../core/Store";
import { accept } from "../../../utils/validation/Validator";

type ProfileEditFieldsProps = {
  user: User;
};

class ProfileEditFields extends FormBlock<ProfileEditFieldsProps> {
  template = hbs;
  avatarFormName = "avatar-form";

  constructor(props: ProfileEditFieldsProps) {
    super(props);

    const avatarImg = new Avatar({
      src: this.props.user.avatar as string,
      className: ["profile__avatar"],
    });

    const avatarInput = new Input({
      type: "file",
      name: "avatar",
      className: ["edit-logo__form-attach", "visually-hidden"],
      id: "edit-logo-attach",
      accept: accept,
      formName: this.avatarFormName,
      onChange: (event) => {
        if (this.isFormEvent(event, this.avatarFormName)) {
          if (this.controller instanceof UserController) {
            const formData = this.getFormData(this.avatarFormName);
            this.controller.changeAvatar(formData);
          }
        }
      },
    });

    const emailInput = new Input({
      name: "email",
      label: "Почта",
      labelClassName: ["profile__data-container"],
      value: this.props.user.email,
    });

    const loginInput = new Input({
      name: "login",
      label: "Логин",
      labelClassName: ["profile__data-container"],
      value: this.props.user.login,
    });

    const firstNameInput = new Input({
      name: "first_name",
      label: "Имя",
      labelClassName: ["profile__data-container"],
      value: this.props.user.first_name,
    });

    const secondNameInput = new Input({
      name: "second_name",
      label: "Фамилия",
      labelClassName: ["profile__data-container"],
      value: this.props.user.second_name,
    });

    const displayNameInput = new Input({
      name: "display_name",
      label: "Имя в чатах",
      labelClassName: ["profile__data-container"],
      value: this.props.user.display_name || "",
    });

    const phoneInput = new Input({
      name: "phone",
      label: "Телефон",
      labelClassName: ["profile__data-container"],
      value: this.props.user.phone,
    });

    const formAvatarInfo = new InfoMessage();
    const formInfo = new InfoMessage();

    const saveButton = new Button({
      text: "Сохранить",
      type: "submit",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatarImg,
      avatarInput,
      emailInput,
      loginInput,
      firstNameInput,
      secondNameInput,
      displayNameInput,
      phoneInput,
      formAvatarInfo,
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
      submit: (event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          const formIsValid = this.formValidate();
          if (!formIsValid) {
            return;
          }

          this.children.saveButton.setProps({ disabled: true });

          if (this.controller instanceof UserController) {
            const formData = this.getFormData();
            this.controller.changeProfile(formData);
          }
        }
      },
    };
  }

  protected componentDidMount(): void {
    super.componentDidMount();
    this.controller = new UserController();
    this.formErrorListener({
      formKey: "avatar",
      formInfo: this.children.formAvatarInfo as InfoMessage,
      formName: this.avatarFormName,
    });
    this.formErrorListener({
      formKey: "profile",
      submitBtn: this.children.saveButton as Button,
      formInfo: this.children.formInfo as InfoMessage,
    });

    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          if (state.user) {
            this.setProps({ user: state.user });
            this.children.saveButton.setProps({ disabled: false });
            this.formSuccessMessage(this.children.formInfo as InfoMessage);
          }
        },
        observer: (state) => state.user,
      }),
    );
  }
}

export default ProfileEditFields;
