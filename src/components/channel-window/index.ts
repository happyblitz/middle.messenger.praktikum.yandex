import Block from "../../core/Block";
import { getFileName } from "../../utils/Globals";
import ChannelAPI from "../../api/ChannelApi";
import type { Message } from "../../api/static-data/messages_static";
import Input from "../input-field";
import Button from "../button";
import Text from "../text";
import TextArea from "../textarea";
import ChannelMessage from "./channel-message";
import ShowAttach from "./show-attach";
import hbs from "./template.hbs?raw";
import backIcon from "../../resources/icons/back.svg?raw";
import attachIcon from "../../resources/icons/attach.svg?raw";
import sendIcon from "../../resources/icons/send.svg?raw";
import settingsIcon from "../../resources/icons/settings.svg?raw";
import type { Chat } from "../../core/Store";
import ChannelInfo from "../channel-info";
import store from "../../core/Store";
import type { User } from "../../core/Store";
import ChatController from "../../controllers/ChatController";
import { getDisplayName, getUserAvatar } from "../../utils/Globals";
import "./styles.scss";

type ChannelWindowProps = {
  chat?: Chat;
  attachIcon?: string;
  attachFieldName?: string;
  onBack: () => void;
  chatUsers?: User[];
};

class ChannelWindow extends Block<ChannelWindowProps> {
  template = hbs;
  cssHideClassName = "visually-hidden";
  submitBtnDefaultClasses = [
    "channel__footer-form-send",
    this.cssHideClassName,
  ];
  chatController: ChatController | null = null;
  user: User = store.getState().user as User;

  constructor(props: ChannelWindowProps) {
    super({ attachFieldName: "attach", attachIcon, ...props });

    const backButton = new Button({
      text: backIcon,
      className: ["channel__header-back"],
      ariaLabel: "к списку чатов",
      title: "к списку чатов",
      onClick: () => this.props.onBack(),
    });

    const chatUsersButton = new Button({
      text: "Пользователи",
      onClick: () => {
        this.children.channelInfo.setProps({ show: true });
      },
    });

    const settingsButton = new Button({
      text: settingsIcon,
      className: ["channel__header-tools-settings"],
      ariaLabel: "настройки чата",
      title: "настройки чата",
    });

    const deleteChatButton = new Button({
      text: "Удалить чат",
      onClick: () => {
        if (this.props?.chat?.id) {
          this.chatController?.chatDelete(this.props.chat.id);
        }
      },
    });

    const submitButton = new Button({
      type: "submit",
      text: sendIcon,
      className: this.submitBtnDefaultClasses,
      ariaLabel: "отправить",
      title: "отправить",
    });

    const attachInput = new Input({
      type: "file",
      name: this.props.attachFieldName as string,
      className: ["channel__footer-form-attach"],
      id: this.props.attachFieldName as string,
      accept: "image/*",
    });

    const areaInput = new TextArea({
      name: "message",
      className: ["channel__footer-form-input"],
      placeholder: "Ваше сообщение",
    });

    const subTitle = new Text({ text: "" });

    const showAttach = new ShowAttach({
      onClick: () => {
        // очищаем поле формы
        const formAttach = this.getFormAttachElement();
        formAttach.value = "";
        // скрываем названием файла и кнопку удаления файла
        this.children.showAttach.setProps({ filename: "" });
        // если инпут пустой, скрываем submit кнопку
        const input = this.getInputValue();
        if (!input) {
          this.hideSubmitButton();
        }
      },
    });

    const channelInfo = new ChannelInfo({ show: false, chat: this.props.chat });

    this.children = {
      backButton,
      channelInfo,
      subTitle,
      chatUsersButton,
      deleteChatButton,
      settingsButton,
      showAttach,
      submitButton,
      attachInput,
      areaInput,
    };

    this.events = {
      change: (event) => {
        // обработчик добавления/удаления файла формы сообщения
        const target = event.target as HTMLInputElement;
        if (target && target.name === this.props.attachFieldName) {
          const formAttach = this.getFormAttachElement();
          if (formAttach.files) {
            // отобразим файл и кнопку удаления файла
            const filename = formAttach.files[0].name;
            this.children.showAttach.setProps({
              filename,
              onClick: () => {
                formAttach.value = "";
              },
            });
            // отобразим кнопку отправки сообщения
            this.showSubmitButton();
          }
        }
      },
      input: (event) => {
        const target = event.target;
        if (target === this.children.areaInput.element()) {
          // если есть инпут сразу отобразим sumbit кнопку
          const input = this.getInputValue();
          if (input) {
            this.showSubmitButton();
            return;
          }

          // проверим наличие аттача
          const formAttach = this.getFormAttachElement();
          const filename = formAttach?.files?.[0]?.name;

          if (filename) {
            this.showSubmitButton();
            return;
          }

          this.hideSubmitButton();
        }
      },
      submit: async (event) => {
        event.preventDefault();

        const form = this.getForm();
        const formdata = new FormData(form);

        const input = (formdata.get("message") as string).trim();
        const attach = (formdata.get("attach") as File).name;

        const hasData = (input || attach) && this.props.chat?.id;
        if (!hasData) {
          return;
        }

        this.children.submitButton.setProps({
          disabled: true,
          className: this.submitBtnDefaultClasses,
        });

        form.reset();

        // скрываем поле с файлом и кнопкой отмены
        this.children.showAttach.setProps({ filename: "" });

        let message: Message;

        try {
          const msg = await ChannelAPI.newMessage(
            this.props.chat?.id as number,
            formdata,
          );
          message = msg.message;
        } catch (error) {
          message = {
            message: error as string,
            username: getDisplayName(this.user),
            avatar: getUserAvatar(this.user),
          };
        }

        const messageElement = this.getMessageElement(message) as HTMLElement;
        const container = this.getRef("messages") as HTMLElement;
        container.append(messageElement);

        this.scrollEnd([messageElement]);

        this.children.submitButton.setProps({
          disabled: false,
        });
      },
    };
  }

  protected beforeCompile(): void {
    this.chatController = new ChatController();
    const chatId = this.props.chat?.id;
    if (chatId) {
      // просим контролер запросить список пользователей чата
      this.chatController.getChatUsers(chatId);

      // получаем список пользователей чата из стора
      const chatUsers = store.getState().chatUsers?.[chatId];
      this.usersLoaded(chatUsers);

      // подписка на стор: пользователи чата
      this.unsubscribers.push(
        store.subscribe({
          action: (state) => {
            const chatUsers = state.chatUsers?.[chatId];
            this.usersLoaded(chatUsers);
          },
          observer: (state) => state.chatUsers?.[chatId],
        }),
      );
    }
  }

  protected componentDidMount(): void {
    super.componentDidMount();
    this.children.channelInfo.setProps({ chat: this.props.chat });
  }

  /**
   * Хук выполняемый после получения пользователей от стора
   * @param chatUsers
   */
  protected usersLoaded(chatUsers: User[] = []) {
    this.setSubTitle(chatUsers);

    // если пользователь админ, разблокируем кнопку: удалить чат
    let isAdmin = false;
    for (const u of chatUsers) {
      if (u.id === this.user.id) {
        isAdmin = u.role === "admin";
      }
    }

    this.children.deleteChatButton.setProps({ disabled: !isAdmin });
  }

  /**
   * Подзаголовок чата
   * @param chatUsers
   */
  protected setSubTitle(chatUsers: User[] = []) {
    const subTitle =
      chatUsers?.map((user) => getDisplayName(user)).join(", ") ?? "";
    this.children.subTitle.setProps({ text: subTitle });
  }

  private getFormAttachElement() {
    const form = this.getForm();
    return form.querySelector(
      `[name=${this.props.attachFieldName}]`,
    ) as HTMLInputElement;
  }

  private getForm() {
    return this.getRef("form") as HTMLFormElement;
  }

  private getInputValue() {
    return (
      this.children.areaInput.element() as HTMLTextAreaElement
    ).value.trim();
  }

  private showSubmitButton() {
    this.children.submitButton
      .element()
      ?.classList.remove(this.cssHideClassName);
  }

  private hideSubmitButton() {
    this.children.submitButton.element()?.classList.add(this.cssHideClassName);
  }

  private getMessageElement(message: Message) {
    const ChannelMessageProps = {
      ...message,
      imageDesc: getFileName(message.image ?? ""),
    };

    const channelMessage = new ChannelMessage(ChannelMessageProps);
    return channelMessage.element();
  }

  // правильнее заранее знать размеры картинок
  // и сообщать браузеру их размеры во время вставки
  private scrollEnd(elements: HTMLElement[]) {
    const imagePromises: Promise<void>[] = [];

    // 1. Собираем картинки в массив промисов
    elements.forEach((element) => {
      const newImages = Array.from(element.querySelectorAll("img"));

      newImages.forEach((img) => {
        if (img.complete) return; // Если картинка уже в кэше, пропускаем

        const promise = new Promise<void>((resolve) => {
          // Используем { once: true } для автоматического удаления слушателя браузером
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });

        imagePromises.push(promise);
      });
    });

    // 2. Ждем загрузку новых картинок (но не дольше 300мс)
    Promise.race([
      Promise.all(imagePromises),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]).then(() => {
      const mainContainer = this.getRef("messages-container") as HTMLElement;
      if (mainContainer) {
        mainContainer.scrollTo({
          top: mainContainer.scrollHeight,
          behavior: "auto",
        });
      }
    });
  }
}

export default ChannelWindow;
