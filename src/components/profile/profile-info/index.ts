import Block from "../../../core/Block";
import Button from "../../button";
import Avatar from "../../avatar";
import type { User } from "../../../api/static-data/profile_fields_static";
import hbs from "./template.hbs?raw";

type ProfileInfoProps = {
  user: User;
  onEditProfile: () => void;
  onChangePasswrod: () => void;
  profileFields?: Omit<User, "avatar">;
};

class ProfileInfo extends Block<ProfileInfoProps> {
  template = hbs;

  constructor(props: ProfileInfoProps) {
    const { avatar, ...profileFields } = { ...props.user };

    super({ ...props, profileFields });

    this.props.profileFields = profileFields;

    const avatarImg = new Avatar({
      src: avatar.value,
      className: ["profile__avatar"],
    });

    const editProfileButton = new Button({
      text: "Изменить данные",
      className: ["profile__controls-edit"],
      onClick: this.props.onEditProfile,
    });

    const newPasswordButton = new Button({
      text: "Изменить пароль",
      className: ["profile__controls-edit"],
      onClick: this.props.onChangePasswrod,
    });

    const logoutButton = new Button({
      text: "Выйти",
      className: ["profile__controls-logout"],
    });

    this.children = {
      editProfileButton,
      newPasswordButton,
      logoutButton,
      avatarImg,
    };
  }
}

export default ProfileInfo;
