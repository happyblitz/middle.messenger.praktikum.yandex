import FormBlock from "../../../core/FormBlock";
import Button from "../../button";
import Input from "../../input-field";
import Avatar from "../../avatar";
import type { User } from "../../../api/static-data/profile_fields_static";
import FormValidator from "../../../utils/validation/FormValidator";
import { isEventInForm, isSubmitRelatedTarget } from "../../../utils/Dom";
import type { SyncInputsArgs } from "../../../core/FormBlock";
import hbs from "./template.hbs?raw";

type ProfileChangePasswordProps = {
  user: User;
};

class ProfileChangePassword extends FormBlock<ProfileChangePasswordProps> {
  template = hbs;

  constructor(props: ProfileChangePasswordProps) {
    super(props);

    const avatarImg = new Avatar({
      src: this.props.user.avatar.value,
      className: ["profile__avatar"],
    });

    const oldPassInput = new Input({
      type: "password",
      name: "old_password",
      label: "Текущий пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "password",
    });

    const passwordInput = new Input({
      type: "password",
      name: "new_password",
      label: "Новый пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "new_password",
    });
    const confirmPasswordInput = new Input({
      type: "password",
      name: "new_password_confirm",
      label: "Повторите новый пароль",
      labelClassName: ["profile__data-container"],
      autocomplete: "new_password_confirm",
    });
    const saveButton = new Button({
      type: "submit",
      text: "Сохранить",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatarImg,
      oldPassInput,
      passwordInput,
      confirmPasswordInput,
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
      !inputName ||
      ["new_password", "new_password_confirm"].includes(inputName);

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

export default ProfileChangePassword;
