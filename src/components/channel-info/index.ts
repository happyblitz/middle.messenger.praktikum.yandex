import FormBlock from "../../core/FormBlock";
import Input from "../input-field";
import Button from "../button";
import hbs from "./template.hbs?raw";
import "./styles.scss";
import debounce from "../../utils/functions/debounce";
import UserController from "../../controllers/UserController";
import ChatController from "../../controllers/ChatController";
import store from "../../core/Store";
import UsersList from "./user-list";
import UsersListSelected from "./user-list-selected";
import type { User } from "../../core/Store";
import InfoMessage from "../info-message";
import closeIcon from "../../resources/icons/close.svg?raw";
import type { Chat } from "../../core/Store";

type ChannelInfoProps = {
  show: boolean;
  chat?: Chat;
};

// ключ - uid
type UsersListType = Record<string, User>;

class ChannelInfo extends FormBlock<ChannelInfoProps> {
  template = hbs;
  userController: UserController | null = null;
  chatController: ChatController | null = null;
  requestId: number = 0; // номер запроса, чтобы не отображать устаревшие данные
  users: UsersListType = {}; // найденные через поиск
  selectedUsers: UsersListType = {}; // выбранные через форму
  chatUsers: User[] = []; // уже привязанные к чату

  constructor(props: ChannelInfoProps) {
    super(props);

    const debounceSearch = debounce((e) => {
      const target = e.target as HTMLInputElement;
      if (target && this.userController) {
        this.userController.userSearch(++this.requestId, target.value);
      }
    }, 500);

    const userSearch = new Input({
      label: "Добавить участников",
      name: "channelUsers",
      className: ["popup__input"],
      labelClassName: ["popup__label"],
      placeholder: "поиск по логину",
      onInput: debounceSearch,
    });

    const usersList = new UsersList({
      onClick: (e) => {
        const target = e.target as HTMLElement;
        if (target) {
          const element = target.closest("li");
          if (element && element.hasAttribute("data-id")) {
            const id = element.getAttribute("data-id") || "";
            if (id in this.users && !(id in this.selectedUsers)) {
              this.selectedUsers[id] = { ...this.users[id] };
              this.setSelectedUsers();
            }
          }
        }
      },
    });

    const usersListSelected = new UsersListSelected({
      onClick: (e) => {
        const target = e.target as HTMLButtonElement;
        if (target) {
          const element = target.closest("button");
          if (element && element.hasAttribute("data-id")) {
            const id = element.getAttribute("data-id") || "";
            if (id in this.selectedUsers) {
              delete this.selectedUsers[id];
            }
            this.setSelectedUsers();
          }
        }
      },
    });

    const formInfo = new InfoMessage();

    const submitButton = new Button({
      text: "Отправить",
      type: "submit",
      className: ["popup__button button "],
    });

    const modalCloseButton = new Button({
      text: closeIcon,
      className: ["modal-close"],
      ariaLabel: "Закрыть модально окно",
      title: "Закрыть",
      onClick: () => {
        this.setProps({ show: false });
      },
    });

    this.children = {
      modalCloseButton,
      userSearch,
      usersList,
      usersListSelected,
      formInfo,
      submitButton,
    };

    this.events = {
      submit: (event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          this.chatController?.setChatUsers(
            this.props.chat as Chat,
            Object.keys(this.selectedUsers).map((i) => Number(i)),
          );
          this.setProps({ show: false });
        }
      },
    };
  }

  protected componentDidMount(): void {
    super.componentDidMount();
    this.userController = new UserController();
    this.chatController = new ChatController();

    // запрашиваем пользователей чата
    if (this.props.chat?.id) {
      const chatId = this.props.chat.id;

      // просим контролер запросить список пользователей чата
      this.chatController.getChatUsers(chatId);

      // получаем список пользователей чата из стора
      const chatUsers = store.getState().chatUsers?.[chatId];
      this.handleChatUsersFromStore(chatUsers);

      // подписка на стор: пользователи чата
      this.unsubscribers.push(
        store.subscribe({
          action: (state) => {
            const chatUsers = state.chatUsers?.[chatId];
            this.handleChatUsersFromStore(chatUsers);
          },
          observer: (state) => state.chatUsers?.[chatId],
        }),
      );
    }

    // подписка на стор: слушаем ошибки формы
    this.formErrorListener({
      formKey: "chatSettings",
      submitBtn: this.children.submitButton as Button,
      formInfo: this.children.formInfo as InfoMessage,
    });

    // подписка на стор: поиск пользователей
    this.unsubscribers.push(
      store.subscribe({
        action: (state) => {
          const requestId = state.data?.userSearch?.requestId || 0;
          if (requestId === this.requestId) {
            const usersList = state.data?.userSearch?.users || [];
            this.users = Object.fromEntries(usersList.map((u) => [u.id, u]));
            this.children.usersList.setProps({ usersList });
          }
        },
        observer: (state) => state.data?.userSearch,
      }),
    );
  }

  /**
   * Обработка списка пользователей из стора
   */
  protected handleChatUsersFromStore(users: User[] = []) {
    if (users) {
      // удаляем пользователя из этого списка
      const userId = store.getState().user?.id;
      this.chatUsers = users.filter((u) => u.id !== userId);
      this.selectedUsers = Object.fromEntries(
        this.chatUsers.map((u) => [u.id, u]),
      );
      this.setSelectedUsers();
    }
  }

  /**
   * Обновляет список выбранных пользователей
   */
  protected setSelectedUsers() {
    const selectedUsers = Object.values(this.selectedUsers);
    this.children.usersListSelected.setProps({ selectedUsers });
  }
}

export default ChannelInfo;
