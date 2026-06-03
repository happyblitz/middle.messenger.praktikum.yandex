import Block from "../../core/Block";
import ProfileInfo from "./profile-info";
import ProfileEditFields from "./profile-edit-fields";
import ProfileChangePassword from "./profile-change-password";
import ProfileFooter from "./profile-footer";
import hbs from "./template.hbs?raw";
import "./styles.scss";
import store from "../../core/Store";
import type { User } from "../../core/Store";
import * as userUtils from "../../utils/User";

type ProfileProps = {
  page: "info" | "edit-fields" | "edit-password";
  user?: User | null;
  onDeepClose: () => void;
};

class Profile extends Block<ProfileProps> {
  template = hbs;

  constructor(props: ProfileProps) {
    super(props);

    const footer = new ProfileFooter({ onDeepClose: null });

    this.children = {
      footer,
    };
  }

  protected beforeCompile() {
    const user = store.getState().user;
    this.props.user = user ? { ...user } : null;

    if (this.props.user) {
      const display_name = userUtils.getDisplayName(this.props.user);
      const avatar = userUtils.getUserAvatar(this.props.user);
      this.props.user = { ...this.props.user, display_name, avatar };

      switch (this.props.page) {
        case "info":
          this.children.content = new ProfileInfo({
            user: this.props.user,
            onEditProfile: () => {
              this.setProps({ page: "edit-fields" });
            },
            onChangePasswrod: () => {
              this.setProps({ page: "edit-password" });
            },
          });
          this.children.footer.setProps({
            onDeepClose: null,
          });
          break;
        case "edit-fields":
          this.children.content = new ProfileEditFields({
            user: this.props.user,
          });
          this.children.footer.setProps({
            onDeepClose: this.props.onDeepClose,
          });
          break;
        case "edit-password":
          this.children.content = new ProfileChangePassword({
            user: this.props.user,
          });
          this.children.footer.setProps({
            onDeepClose: this.props.onDeepClose,
          });
          break;
      }
    }
  }
}

export default Profile;
