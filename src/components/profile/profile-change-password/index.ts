import Block from "../../../utils/Block";
import Button from "../../button";
import Input from "../../input-field";
import Avatar from "../../avatar";
import type { User } from "../../../api/static-data/profile_fields_static";
import hbs from "./template.hbs?raw";

type ProfileChangePasswordProps = {
  user: User;
};

class ProfileChangePassword extends Block<ProfileChangePasswordProps> {
  template = hbs;

  constructor(props: ProfileChangePasswordProps) {
    super(props);

    const avatarImg = new Avatar({
      src: this.props.user.avatar.value,
      className: ["profile__avatar"],
    });

    const saveButton = new Button({
      text: "Сохранить",
      className: ["profile__controls-edit"],
    });

    this.children = {
      avatarImg,
      saveButton,
    };
  }
}

export default ProfileChangePassword;
