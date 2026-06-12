import Block from "../../../core/Block";
import hbs from "./template.hbs?raw";
import type { User } from "../../../core/Store";
import closeIcon from "../../../resources/icons/close.svg?raw";
import "./styles.scss";

type UsersListSelectedProps = {
  selectedUsers?: User[];
  onClick?: (e: Event) => void;
  closeIcon?: string;
};

class UsersListSelected extends Block<UsersListSelectedProps> {
  template = hbs;

  constructor(props: UsersListSelectedProps) {
    super({ ...props, closeIcon });

    if (this.props.onClick) {
      this.events = {
        click: this.props.onClick,
      };
    }
  }
}

export default UsersListSelected;
