import Block from "../../../core/Block";
import Button from "../../button";
import Input from "../../input-field";
import Avatar from "../../avatar";
import type { User } from "../../../api/static-data/profile_fields_static";
import hbs from "./template.hbs?raw";

type ProfileEditFieldsProps = {
  user: User;
  profileFields?: Omit<User, "avatar">;
};

class ProfileEditFields extends Block<ProfileEditFieldsProps> {
  template = hbs;

  constructor(props: ProfileEditFieldsProps) {
    const { avatar, ...profileFields } = { ...props.user };

    super({ ...props, profileFields });

    this.props.profileFields = profileFields;

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
    });

    const saveButton = new Button({
      text: "Сохранить",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatarImg,
      avatarInput,
      saveButton,
    };
  }
}

export default ProfileEditFields;
