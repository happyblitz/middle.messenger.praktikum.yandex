import Block from "../../core/Block";
import Input from "../../components/input-field";
import Button from "../../components/button";
import ChannelCard from "../../components/channel-card";
import ChannelWindow from "../../components/channel-window";
import NewChannel from "../../components/new-channel";
import hbs from "./template.hbs?raw";
import burderIcon from "./burger.svg?raw";
import Router from "../../core/Router";
import store from "../../core/Store";
import type { Chat } from "../../core/Store";
import "./styles.scss";

type MessengerProps = {
  activeChatCard?: number | null;
  chats?: Chat[];
};

class MessengerPage extends Block<MessengerProps> {
  template = hbs;
  channelCards: Record<string, ChannelCard> = {};

  constructor() {
    super({
      activeChatCard: null,
    });

    const menuButton = new Button({
      text: burderIcon,
      className: ["messenger__burger-button"],
      ariaLabel: "Меню",
      title: "Меню",
      onClick: () => {
        Router.getInstance().goto("/settings");
      },
    });

    const searchInput = new Input({
      type: "search",
      name: "search",
      className: ["messenger__header-search"],
    });

    const newChannelButton = new Button({
      text: "Новый чат",
      className: ["messenger__new-channel"],
      onClick: () => {
        this.children.newChannelModal.setProps({ show: true });
      },
    });

    const channelWindow = new ChannelWindow({
      onBack: this.showChannelsList,
    });

    const newChannelModal = new NewChannel({
      show: false,
    });

    this.children = {
      menuButton,
      searchInput,
      newChannelButton,
      channelWindow,
      newChannelModal,
    };
  }

  protected componentDidMount() {
    this.props.chats = store.getState().chats ?? [];

    const container = this.getRef("channelList");

    if (!container) {
      return;
    }

    const elements: HTMLElement[] = [];

    this.props.chats.forEach((chat) => {
      const date = chat?.last_message?.time
        ? new Intl.DateTimeFormat("ru-RU").format(
            new Date(chat?.last_message?.time),
          )
        : "";

      const channelCardProps = {
        chat,
        formats: {
          date,
          last_message: chat?.last_message?.content.slice(0, 80) ?? "",
        },
        isActive: false,
        onSelect: () => this.setActiveChat(chat),
      };

      const li = document.createElement("li");
      li.classList.add("channels__item");

      const channelCard = new ChannelCard(channelCardProps);
      const element = channelCard.element();

      if (element) {
        li.append(element);
        elements.push(li);
        this.channelCards[chat.id] = channelCard;
      }

      this.setActiveChat();
    });

    container.append(...elements);

    this.setStoreListeners();
  }

  // вспомогательная функция
  // открывает окно чата на маленьких экранах
  // или схлопывает при нажатии на кнопку назад (к чатам)
  private showChannelsList(event?: Event) {
    const messengerElement = this.getRef("messenger");
    if (messengerElement) {
      if (event) {
        if (this.props.activeChatCard) {
          this.toggleChannelCard(this.props.activeChatCard);
          this.props.activeChatCard = null;
        }
        messengerElement.classList.remove("channel-is-active");
      } else {
        messengerElement.classList.add("channel-is-active");
      }
    }
  }

  // переключает выделение карточки чата
  private toggleChannelCard(id: number) {
    const channelCard = this.channelCards[id];
    if (channelCard) {
      channelCard.element()?.classList.toggle("isActive");
    }
  }

  protected setStoreListeners() {
    // слушаем изменение списка чатов
    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          this.setProps({ chats: state.chats });
        },
        observer: (state) => state.chats,
      }),
    );

    // если был создан новый чат, перейдем на него
    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          const activeChatId = state.data?.newChatId;
          if (activeChatId) {
            const activeChat = this.props.chats?.find(
              (c) => c.id === activeChatId,
            );
            if (activeChat) {
              this.setActiveChat(activeChat);
            }
          }
        },
        observer: (state) => state.data?.newChatId,
      }),
    );
  }

  /**
   * Переход на активный чат
   * @param chat
   * @returns
   */
  protected setActiveChat(chat: Chat | null = null) {
    if (chat === null) {
      if (this.props.activeChatCard) {
        // если текущий чат был удален, пересоберм окно чата
        const isChatWasDeleted = this.props.chats?.every(
          ({ id }) => id !== this.props.activeChatCard,
        );
        if (isChatWasDeleted) {
          this.props.activeChatCard = null;
          this.children.channelWindow.setProps({
            chat: null,
          });
        }
      }

      return;
    }

    // этот чат уже активный
    if (this.props.activeChatCard === chat.id) {
      return;
    }

    // снимаем выделение со старого чата
    if (this.props.activeChatCard) {
      const oldCard = this.channelCards[this.props.activeChatCard];
      if (oldCard) {
        oldCard.element()?.classList.toggle("isActive");
      }
    }

    // выделяем активный чат
    const newCard = this.channelCards[chat.id];
    if (newCard) {
      newCard.element()?.classList.toggle("isActive");
    }

    // запоминаем новый активный чат
    this.props.activeChatCard = chat.id;

    // скрываем список чата для мобильной версии
    // отображаем только сам чат
    this.showChannelsList();

    // перерисовываем окно чата
    this.children.channelWindow.setProps({
      chat,
      onBack: this.showChannelsList,
    });
  }

  /**
   * сбрасывает активный чат
   */
  resetActiveChat() {
    // перерисовываем окно чата
    this.children.channelWindow.setProps({
      chat: null,
    });

    // сбрасываем активный чат
    this.props.activeChatCard = null;
  }
}

export default MessengerPage;
