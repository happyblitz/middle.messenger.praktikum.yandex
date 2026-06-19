import Block from "../../core/Block";
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
import ResourceController from "../../controllers/ResourceController";
import { getDisplayName } from "../../utils/Globals";
import ChatWebSocketController from "../../controllers/ChatWebSocketController";
import type { Message } from "../../core/Store";
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
  resourceController: ResourceController | null = null;
  socketController: ChatWebSocketController | null = null;
  user: User = store.getState().user as User;
  messages: Record<number, Message> = {};
  processFiles: Set<string> = new Set();
  isLoadingMore: boolean = false;
  scrollHandler: (() => void) | null = null;
  scrollHeight: number = 0;

  constructor(props: ChannelWindowProps) {
    super({ attachFieldName: "resource", attachIcon, ...props });

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
        const formData = new FormData(form);

        const input = (formData.get("message") as string).trim();
        const attach = formData.get(this.props.attachFieldName!) as File;
        const isAttach = attach && attach.size > 0;
        const hasData = (input || isAttach) && this.props.chat?.id;

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

        // отправляем текстовое сообщение
        this.socketController?.send(input);

        // загружаем файл на сервер
        if (isAttach) {
          formData.delete("message");
          this.resourceController?.newResource(formData);
          this.processFiles.add(attach.name);
        }

        this.children.submitButton.setProps({
          disabled: false,
        });
      },
    };
  }

  protected async componentDidMount() {
    super.componentDidMount();

    this.chatController = new ChatController();

    this.children.channelInfo.setProps({ chat: this.props.chat });

    const chatId = this.props.chat?.id;
    if (chatId) {
      // просим контролер запросить список пользователей чата
      this.chatController.getChatUsers(chatId);

      // получаем список пользователей чата из стора
      const chatUsers = store.getState().chatUsers?.[chatId];
      this.usersLoaded(chatUsers);

      // подгружаем сообщения
      const container = this.getMessagesContainer();
      if (container) {
        this.scrollHandler = () => {
          if (this.isScrollNearTop() && !this.isLoadingMore) {
            this.isLoadingMore = true;
            this.scrollHeight = container.scrollHeight;
            this.socketController!.getMessages();
          }
        };

        container.addEventListener("scroll", this.scrollHandler);
      }

      // подписка на стор: новые сообщения
      this.unsubscribers.push(
        store.subscribe({
          action: () => {
            this.renderMessages();
          },
          observer: (state) => state.messages?.[chatId],
        }),
      );

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

      this.resourceController = new ResourceController();

      // делаем операцию с await последней,
      // чтобы слушатели не пропустили расстылку стора
      this.socketController = new ChatWebSocketController(chatId);
      await this.socketController.init();
      this.socketController.getMessages();

      // подписка на стор: файл загружен на сервер
      this.unsubscribers.push(
        store.subscribe({
          action: (state) => {
            const uploadedFiles = state.response?.uploadFiles ?? {};
            this.processFiles.forEach((f) => {
              if (f in uploadedFiles) {
                // отправляем сообщение
                this.socketController!.send(
                  uploadedFiles[f].id.toString(),
                  "file",
                );
                // удаляем файл из памяти
                this.fileWasProcessed(f);
              }
            });
          },
          observer: (state) => state.response?.uploadFiles,
        }),
      );
    }
  }

  protected componentWillUnmount(): void {
    // clear messages
    this.socketController?.clearMessages();
    this.messages = {};
    // close socket connection
    this.socketController?.unmount();

    const container = this.getMessagesContainer();
    if (container && this.scrollHandler) {
      container.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  }

  /**
   * рендер сообщений, выводим без компонента сразу на страницу как статику
   * если потребуется их изменение, переделаю на компонент
   * @returns
   */
  protected renderMessages() {
    if (!this.props.chat?.id) {
      return;
    }

    const messages = store.getState().messages?.[this.props.chat.id] ?? [];
    if (messages.length === 0) {
      return;
    }

    const container = this.getRef("messages") as HTMLElement;

    const wasAtBottom = this.isScrollAtBottom();

    const earliestMessageTime = Object.values(this.messages).reduce(
      (acc, m) => {
        if (acc) {
          return acc > m.time ? m.time : acc;
        }

        return m.time;
      },
      "",
    );

    const elements: HTMLElement[] = [];
    let messageElement;

    const newMessages: HTMLElement[] = [];
    const oldMessages: HTMLElement[] = [];

    messages.forEach((m) => {
      const isProcessed = m.id in this.messages;
      if (!isProcessed) {
        messageElement = this.getMessageElement(m) as HTMLElement;
        // новые сообщения вперед, старые назад
        if (m.time > earliestMessageTime) {
          newMessages.push(messageElement);
        } else {
          oldMessages.push(messageElement);
        }

        elements.push(messageElement);
        this.messages[m.id] = m;
      }
    });

    newMessages.forEach((m) => container.append(m));

    oldMessages.reverse().forEach((m) => {
      container.prepend(m);
    });

    // компенсация скрола
    if (this.isLoadingMore) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - this.scrollHeight;
      this.isLoadingMore = false;
    }

    // если ранее были внизу
    // прокручиваем вниз до последнего сообщения
    if (wasAtBottom) {
      this.scrollEnd(elements);
    }
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
    const channelMessage = new ChannelMessage({
      chatId: this.props.chat!.id,
      message,
    });
    return channelMessage.element();
  }

  /**
   * Возвращает ссылку на элемент @messages-container
   * @returns
   */
  private getMessagesContainer() {
    return this.getRef("messages-container") as HTMLElement;
  }

  /**
   * Файл был обработан и нам больше не нужен
   * @param fileName
   */
  private fileWasProcessed(fileName: string) {
    this.processFiles.delete(fileName);
    this.resourceController!.fileWasProcessed(fileName);
  }

  /**
   * Проверяем, внизу ли скрол, с запасом @threshold
   * @returns
   */
  private isScrollAtBottom(): boolean {
    const container = this.getMessagesContainer();
    if (!container) return false;

    const threshold = 100; // пикселей запаса

    return (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold
    );
  }

  /**
   * Проверяем близок ли скрол к потолку
   * @returns
   */
  private isScrollNearTop(): boolean {
    const container = this.getMessagesContainer();
    if (!container) return false;

    const threshold = 100; // пикселей от верха
    return container.scrollTop <= threshold;
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
      this.doScrollEnd();
    });
  }

  /**
   * Делает прокрутку вниз экрана
   */
  doScrollEnd() {
    const mainContainer = this.getMessagesContainer();
    if (mainContainer) {
      mainContainer.scrollTo({
        top: mainContainer.scrollHeight,
        behavior: "auto",
      });
    }
  }
}

export default ChannelWindow;
