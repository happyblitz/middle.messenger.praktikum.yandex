import Block from "../../core/Block";
import ProfileInfo from "./profile-info";
import ProfileEditFields from "./profile-edit-fields";
import ProfileChangePassword from "./profile-change-password";
import ProfileFooter from "./profile-footer";
import hbs from "./template.hbs?raw";
import "./styles.scss";
import store from "../../core/Store";
import type { User } from "../../core/Store";
import Router from "../../core/Router";

export type ProfileProps = {
  page?: "info" | "edit-profile" | "edit-password";
  user?: User | null;
  onDeepClose?: () => void;
};

class ProfilePage extends Block<ProfileProps> {
  template = hbs;

  constructor(props?: ProfileProps) {
    super({ page: "info", ...props });

    const footer = new ProfileFooter({ onDeepClose: null });

    this.children = {
      footer,
    };
  }

  protected beforeCompile() {
    const user = store.getState().user;
    this.props.user = user ? { ...user } : null;

    if (this.props.user) {
      const onDeepClose = () => Router.getInstance().goto("/settings");

      switch (this.props.page) {
        case "info":
          this.children.content = new ProfileInfo({
            user: this.props.user,
            onEditProfile: () => {
              this.setProps({ page: "edit-profile" });
            },
            onChangePasswrod: () => {
              this.setProps({ page: "edit-password" });
            },
          });
          this.children.footer.setProps({
            onDeepClose: () => Router.getInstance().goto("/messenger"),
          });

          break;
        case "edit-profile":
          this.children.content = new ProfileEditFields({
            user: this.props.user,
          });
          this.children.footer.setProps({
            onDeepClose,
          });
          break;
        case "edit-password":
          this.children.content = new ProfileChangePassword({
            user: this.props.user,
          });
          this.children.footer.setProps({
            onDeepClose,
          });
          break;
        default:
          Router.getInstance().goto("/404");
          break;
      }
    }
  }
}

export default ProfilePage;
