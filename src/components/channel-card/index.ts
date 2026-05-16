import Block from "../../core/Block";
import Avatar from "../avatar";
import hbs from "./template.hbs?raw";
import "./styles.scss";

type ChannelCardProps = {
  id: number;
  avatar: string;
  username: string;
  date: string;
  last_message: string;
  new_messages: number;
  isActive?: boolean;
  onSelect: () => void;
};

class ChannelCard extends Block<ChannelCardProps> {
  template = hbs;

  constructor(props: ChannelCardProps) {
    super(props);

    const avatar = new Avatar({ src: this.props.avatar });

    this.children = {
      avatar,
    };

    this.events = {
      click: () => {
        this.props.onSelect();
      },
    };
  }
}

export default ChannelCard;
