import Block from "../../../core/Block";
import hbs from "./template.hbs?raw";
import type { User } from "../../../core/Store";

type UsersListProps = {
  usersList?: User[];
  onClick?: (e: Event) => void;
};

class UsersList extends Block<UsersListProps> {
  template = hbs;

  constructor(props: UsersListProps) {
    super(props);

    if (this.props.onClick) {
      this.events = {
        click: this.props.onClick,
      };
    }
  }
}

export default UsersList;
