import Block from "../../core/Block";
import ProfileInfo from "./profile-info";
import ProfileEditFields from "./profile-edit-fields";
import ProfileChangePassword from "./profile-change-password";
import ProfileFooter from "./profile-footer";
import hbs from "./template.hbs?raw";
import type { User } from "../../api/static-data/profile_fields_static";
import "./styles.scss";

type ProfileProps = {
  page: "info" | "edit-fields" | "edit-password";
  user?: User;
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
    if (this.props.user) {
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
