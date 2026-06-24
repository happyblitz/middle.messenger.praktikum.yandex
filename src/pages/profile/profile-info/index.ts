import Block from "../../../core/Block";
import Button from "../../../components/button";
import Avatar from "../../../components/avatar";
import type { User } from "../../../core/Store";
import hbs from "./template.hbs?raw";
import AuthController from "../../../controllers/AuthController";
import { getDisplayName, getUserAvatar } from "../../../utils/Globals";

type ProfileInfoProps = {
  user: User;
  displayName?: string;
  onEditProfile: () => void;
  onChangePasswrod: () => void;
};

class ProfileInfo extends Block<ProfileInfoProps> {
  template = hbs;

  constructor(props: ProfileInfoProps) {
    super(props);

    const avatar = new Avatar({
      src: getUserAvatar(this.props.user),
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
      avatar,
    };
  }

  protected beforeCompile(): void {
    this.props.displayName = getDisplayName(this.props.user);
  }
}

export default ProfileInfo;
