import FormBlock from "../../../core/FormBlock";
import Button from "../../button";
import Input from "../../input-field";
import InfoMessage from "../../info-message";
import Avatar from "../../avatar";
import type { User } from "../../../core/Store";
import { isEventInForm, isSubmitRelatedTarget } from "../../../utils/Dom";
import hbs from "./template.hbs?raw";
import UserController from "../../../controllers/UserController";
import store from "../../../core/Store";

type ProfileEditFieldsProps = {
  user: User;
};

class ProfileEditFields extends FormBlock<ProfileEditFieldsProps> {
  template = hbs;

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
      accept: "image/*",
      onChange: (event) => {
        const form = this.getRef("avatar-form");
        if (isEventInForm(event, form)) {
          console.log("chnaged!");

          const attachInput = event.target as HTMLInputElement;
          const formElement = attachInput.closest("form");

          if (formElement) {
            const formdata = new FormData(formElement);
            console.log("formdata => ", formdata);

            // UserApi.changeAvatar(formdata)
            //   .then((image64) => {
            //     this.children.avatarImg.setProps({
            //       src: image64,
            //     });
            //   })
            //   .catch((error) => console.log(error));
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
      value: this.props.user.display_name,
    });

    const phoneInput = new Input({
      name: "phone",
      label: "Телефон",
      labelClassName: ["profile__data-container"],
      value: this.props.user.phone,
    });

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
      formInfo,
      saveButton,
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

          if (this.controller instanceof UserController) {
            this.controller.changeProfile(formData);
          }
        }
      },
    };
  }

  protected componentDidMount(): void {
    this.controller = new UserController();

    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          // общая ошибка (в основном от апи)
          if (state.errors?.formProfile?.form) {
            this.children.formInfo.setProps({
              text: state.errors.formProfile.form,
              error: true,
              success: false,
            });
          }

          // ошибки валидации полей
          if (state.errors?.formProfile?.fields) {
            const errors = state.errors.formProfile.fields;
            this.inputsSetErrors(errors);
          }
        },
        observer: (state) => [
          state.errors?.formProfile?.form,
          state.errors?.formProfile?.fields,
        ],
      }),
    );

    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          if (state.user) {
            this.setProps({ user: state.user });
            this.children.formInfo.setProps({
              text: "сохранено",
              error: false,
              success: true,
              className: "center",
            });
          }
        },
        observer: (state) => state.user,
      }),
    );
  }
}

export default ProfileEditFields;
