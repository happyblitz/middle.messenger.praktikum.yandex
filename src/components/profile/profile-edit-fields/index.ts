import FormBlock from "../../../core/FormBlock";
import Button from "../../button";
import Input from "../../input-field";
import Avatar from "../../avatar";
import type { User } from "../../../api/static-data/profile_fields_static";
import UserApi from "../../../api/UserApi";
import { isEventInForm, isSubmitRelatedTarget } from "../../../utils/Dom";
import hbs from "./template.hbs?raw";

type ProfileEditFieldsProps = {
  user: User;
  profileFields?: Omit<User, "avatar">;
};

class ProfileEditFields extends FormBlock<ProfileEditFieldsProps> {
  template = hbs;

  constructor(props: ProfileEditFieldsProps) {
    const { avatar, ...profileFields } = { ...props.user };

    super({ ...props, profileFields });

    const avatarImg = new Avatar({
      src: avatar.value,
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

            UserApi.changeAvatar(formdata)
              .then((image64) => {
                this.children.avatarImg.setProps({
                  src: image64,
                });
              })
              .catch((error) => console.log(error));
          }
        }
      },
    });

    const saveButton = new Button({
      text: "Сохранить",
      type: "submit",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatarImg,
      avatarInput,
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
          const formdata = new FormData(form);

          console.log("formdata => ", formdata);
          formdata.forEach((value, key) => {
            console.log(`Поле: ${key}, значение ${value}`);
          });
        }
      },
    };
  }

  protected componentDidMount() {
    if (this.props.profileFields) {
      const elements: HTMLElement[] = [];
      Object.entries(this.props.profileFields).forEach(([name, fieldData]) => {
        if (this.children[name]) return;

        const child = new Input({
          name,
          label: fieldData.label,
          labelClassName: ["profile__data-container"],
          value: fieldData.value,
        });

        this.children[name] = child;

        elements.push(child.element() as HTMLElement);
      });

      const container = this.getRef("profile-fields") as HTMLElement;
      container.append(...elements);
    }
  }
}

export default ProfileEditFields;
