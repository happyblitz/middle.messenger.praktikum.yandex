import Block from "../../../core/Block";
import Button from "../../../components/button";
import Avatar from "../../../components/avatar";
import type { User } from "../../../core/Store";
import hbs from "./template.hbs?raw";
import AuthController from "../../../controllers/AuthController";

type ProfileInfoProps = {
  user: User;
  onEditProfile: () => void;
  onChangePasswrod: () => void;
};

class ProfileInfo extends Block<ProfileInfoProps> {
  template = hbs;

  constructor(props: ProfileInfoProps) {
    super(props);

    const avatarImg = new Avatar({
      src: this.props.user.avatar as string,
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
      onClick: () => {
        const controller = new AuthController();
        controller.logout();
      },
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
