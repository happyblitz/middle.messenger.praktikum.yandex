import Block from "../../core/Block";
import Avatar from "../avatar";
import hbs from "./template.hbs?raw";
import "./styles.scss";
import type { Chat } from "../../core/Store";
import { getChannelAvatar } from "../../utils/Globals";
import store from "../../core/Store";
import isEqual from "../../utils/functions/isEqual";

type ChannelCardProps = {
  chat: Chat;
  formats?: { date: string; last_message: string };
  onSelect: () => void;
  isActive?: boolean;
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

  protected beforeCompile(): void {
    const last_message = this.props.chat?.last_message;
    const date = last_message?.time
      ? new Intl.DateTimeFormat("ru-RU").format(new Date(last_message?.time))
      : "";

    this.props.formats = {
      date,
      last_message: last_message?.content.slice(0, 80) ?? "",
    };
  }

  protected componentDidMount(): void {
    // если аватар изменился, перерисуем
    // если нет, то перерисовки не будет из-за сравнения в setProps
    const avatarPath = getChannelAvatar(this.props.chat);
    this.children.avatar.setProps({ src: avatarPath });

    // подписка на стор: изменение чата
    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          const chat = state.chats
            .filter((c) => c.id === this.props.chat.id)
            ?.at(-1);
          const isSameChat = isEqual(this.props.chat, chat);
          if (chat && !isSameChat) {
            this.setProps({ chat });
          }
        },
        observer: (state) => state.chats,
      }),
    );
  }
}

export default ChannelCard;
