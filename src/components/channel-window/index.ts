import Block from "../../core/Block";
import Modal from "../../utils/Modal";
import { getFileName } from "../../utils/Globals";
import ChannelAPI from "../../api/ChannelApi";
import type { Message } from "../../api/static-data/messages_static";
import Input from "../input-field";
import Button from "../button";
import TextArea from "../textarea";
import ChannelMessage from "./channel-message";
import ShowAttach from "./show-attach";
import hbs from "./template.hbs?raw";
import backIcon from "./back.svg?raw";
import cancelIcon from "./close.svg?raw";
import attachIcon from "./attach.svg?raw";
import sendIcon from "./send.svg?raw";
import "./styles.scss";

type ChannelWindowProps = {
  id?: number;
  username?: string;
  attachIcon?: string;
  attachFieldName?: string;
  onBack: () => void;
};

class ChannelWindow extends Block<ChannelWindowProps> {
  template = hbs;
  cssHideClassName = "visually-hidden";
  submitBtnDefaultClasses = [
    "channel__footer-form-send",
    this.cssHideClassName,
  ];

  constructor(props: ChannelWindowProps) {
    super({ attachFieldName: "attach", attachIcon, ...props });

    const backButton = new Button({
      text: backIcon,
      className: ["channel__header-back"],
      ariaLabel: "к списку чатов",
      title: "к списку чатов",
      onClick: this.props.onBack,
    });

    const addToChatButton = new Button({
      text: "Пригласить в чат",
      onClick: () => {
        const modal = this.getRef("addUserModal");
        if (modal) {
          Modal.openModal(modal);
        }
      },
    });

    const removeFromChatButton = new Button({
      text: "Удалить из чата",
      onClick: () => {
        const modal = this.getRef("removeUserModal");
        if (modal) {
          Modal.openModal(modal);
        }
      },
    });

    const settingsButton = new Button({
      text: "...",
      className: ["channel__header-tools-settings"],
      ariaLabel: "настройки чата",
      title: "настройки чата",
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

    const modalCloseButton_1 = new Button({
      text: cancelIcon,
      className: ["modal-close"],
      ariaLabel: "Закрыть модально окно",
      title: "Закрыть",
      onClick: Modal.closeAllModals,
    });

    const modalCloseButton_2 = new Button({
      text: cancelIcon,
      className: ["modal-close"],
      ariaLabel: "Закрыть модально окно",
      title: "Закрыть",
      onClick: Modal.closeAllModals,
    });

    const addUserButton = new Button({
      text: "Добавить",
      className: ["popup__button"],
    });

    const removeUserButton = new Button({
      text: "Удалить",
      className: ["popup__button"],
    });

    const addUserInput = new Input({
      name: "channel-add-user",
      className: ["popup__input"],
    });

    const removeUserInput = new Input({
      name: "channel-remove-user",
      className: ["popup__input"],
    });

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

    this.children = {
      backButton,
      addToChatButton,
      removeFromChatButton,
      settingsButton,
      showAttach,
      submitButton,
      attachInput,
      areaInput,
      modalCloseButton_1,
      modalCloseButton_2,
      addUserButton,
      removeUserButton,
      addUserInput,
      removeUserInput,
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

        const hasData = (input || attach) && this.props.id;
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
            this.props.id as number,
            formdata,
          );
          message = msg.message;
        } catch (error) {
          message = {
            message: error as string,
            username: "user",
            avatar: "/static/avatars/1.svg",
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

  protected componentDidMount() {
    if (!this.props.id) {
      return;
    }

    ChannelAPI.getMessages(this.props.id).then((messages) => {
      if (!messages) {
        return;
      }

      const container = this.getRef("messages") as HTMLDivElement;
      const elements: HTMLElement[] = [];

      messages.forEach((message) => {
        const element = this.getMessageElement(message);
        if (element) {
          elements.push(element);
        }
      });

      container.append(...elements);

      this.scrollEnd(elements);
    });
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
