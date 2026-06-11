import Block from "../../core/Block";
import Avatar from "../avatar";
import hbs from "./template.hbs?raw";
import "./styles.scss";
import type { Chat } from "../../core/Store";
import { getChannelAvatar } from "../../utils/Globals";

type ChannelCardProps = {
  chat: Chat;
  formats: { date: string; last_message: string };
  onSelect: () => void;
};

class ChannelCard extends Block<ChannelCardProps> {
  template = hbs;

  constructor(props: ChannelCardProps) {
    super(props);

    const avatar = new Avatar({ src: getChannelAvatar(this.props.chat) });

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
