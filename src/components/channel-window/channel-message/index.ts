import Block from "../../../core/Block";
import Avatar from "../../avatar";
import hbs from "./template.hbs?raw";
import type { Message } from "../../../core/Store";
import type { User } from "../../../core/Store";
import {
  getDisplayName,
  getUserAvatar,
  getFileUrl,
} from "../../../utils/Globals";
import store from "../../../core/Store";
import isEqual from "../../../utils/functions/isEqual";

type ChannelMessageProps = {
  chatId: number;
  message: Message;
  user?: User;
  image?: string | null;
  displayName?: string;
};

class ChannelMessage extends Block<ChannelMessageProps> {
  template = hbs;

  constructor(props: ChannelMessageProps) {
    super(props);

    this.props.user = this.getUser();

    const avatarPath = getUserAvatar(this.props.user);
    const avatar = new Avatar({ src: avatarPath });

    this.children = {
      avatar,
    };
  }

  protected beforeCompile(): void {
    this.props.displayName = getDisplayName(this.props.user);
    this.props.image =
      this.props.message.type === "file"
        ? getFileUrl(this.props.message.file)
        : null;
  }

  /**
   * @WARNING
   * Если пользователь был в чате, им были отправлены сообщения,
   * а потом его удалили из чата,
   * то его не будет среди пользователей чата, как и информации о нем.
   * Можно было бы запросить информацию по его ID через API, но такого метода нет.
   * Поэтому выводим, что есть.
   */
  protected getUser() {
    const users = store.getState().chatUsers?.[this.props.chatId] ?? [];
    return users.filter((u) => u.id === this.props.message.id)?.[0] as User;
  }

  protected componentDidMount(): void {
    // если аватар изменился, перерисуем
    // если нет, то перерисовки не будет из-за сравнения в setProps
    const avatarPath = getUserAvatar(this.props.user);
    this.children.avatar.setProps({ src: avatarPath });

    // подписка на стор: автор сообщения
    this.unsubscribers.push(
      store.subscribe({
        action: () => {
          const user = this.getUser();
          const isSameUser = isEqual(user, this.props.user);
          if (!isSameUser) {
            this.setProps({ user });
          }
        },
        observer: (state) => state.chatUsers?.[this.props.chatId],
      }),
    );
  }
}

export default ChannelMessage;
