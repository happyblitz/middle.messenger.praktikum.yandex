import Block from "../../utils/Block";
import Input from "../../components/input-field";
import Button from "../../components/button";
import ChannelCard from "../../components/channel-card";
import Profile from "../../components/profile";
import ChannelWindow from "../../components/channel-window";
import ChannelAPI from "../../api/ChannelApi";
import hbs from "./template.hbs?raw";
import burderIcon from "./burger.svg?raw";
import { cssModalClosedClass } from "../../utils/Globals";
import Modal from "../../utils/Modal";
import UserApi from "../../api/UserApi";

import "./styles.scss";

type MessengerProps = {
  activeChatCard?: number | null;
};

class MessengerPage extends Block<MessengerProps> {
  template = hbs;
  channelCards: Record<string, ChannelCard> = {};

  constructor() {
    super({
      activeChatCard: null,
    });

    const onDeepClose = () => {
      this.children.profile.setProps({ page: "info" });
      const profile = this.getRef("profile") as HTMLElement;
      profile.classList.remove(cssModalClosedClass);
    };

    const menuButton = new Button({
      text: burderIcon,
      className: ["messenger__burger-button"],
      ariaLabel: "Меню",
      title: "Меню",
      onClick: () => {
        Modal.closeAllModals();
        onDeepClose();
      },
    });

    const searchInput = new Input({
      type: "search",
      name: "search",
      className: ["messenger__header-search"],
      withError: false,
    });

    const channelWindow = new ChannelWindow({
      onBack: this.showChannelsList.bind(this),
    });

    const profile = new Profile({ page: "info", onDeepClose });

    this.children = {
      menuButton,
      searchInput,
      channelWindow,
      profile,
    };
  }

  protected componentDidMount() {
    UserApi.getCurrentUser()
      .then((user) => {
        this.children.profile.setProps({ user });
      })
      .catch((error) => console.warn(error));

    ChannelAPI.getChannels()
      .then((channelListData) => {
        if (!channelListData) {
          return;
        }

        const container = this.getRef("channelList");

        if (!container) {
          return;
        }

        const elements: HTMLElement[] = [];

        channelListData.forEach((channelData) => {
          const channelCardProps = {
            ...channelData,
            last_message: channelData.last_message.slice(0, 80),
            date: new Intl.DateTimeFormat("ru-RU").format(
              new Date(channelData.timestamp),
            ),
            isActive: false,
            onSelect: () => {
              // same chat
              if (this.props.activeChatCard === channelData.id) {
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
              const newCard = this.channelCards[channelData.id];
              if (newCard) {
                newCard.element()?.classList.toggle("isActive");
              }

              // запоминаем новый активный чат
              this.props.activeChatCard = channelData.id;

              // скрываем список чата для мобильной версии
              // отображаем только сам чат
              this.showChannelsList();

              // перерисовываем окно чата
              this.children.channelWindow.setProps({
                id: channelData.id,
                username: channelData.username,
                onBack: this.showChannelsList.bind(this),
              });
            },
          };

          const li = document.createElement("li");
          li.classList.add("channels__item");

          const channelCard = new ChannelCard(channelCardProps);
          const element = channelCard.element();

          if (element) {
            li.append(element);
            elements.push(li);
            this.channelCards[channelData.id] = channelCard;
          }
        });

        container.append(...elements);
      })
      .catch((error) => console.warn(error));
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
}

export default MessengerPage;
