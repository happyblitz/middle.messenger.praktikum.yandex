import Block from "../../../utils/Block";
import Avatar from "../../avatar";
import hbs from "./template.hbs?raw";

type ChannelMessageProps = {
  avatar: string;
  message: string;
  image?: string;
  imageDesc?: string;
  error?: boolean;
};

class ChannelMessage extends Block<ChannelMessageProps> {
  template = hbs;

  constructor(props: ChannelMessageProps) {
    super(props);

    const avatar = new Avatar({ src: this.props.avatar });

    this.children = {
      avatar,
    };
  }
}

export default ChannelMessage;
