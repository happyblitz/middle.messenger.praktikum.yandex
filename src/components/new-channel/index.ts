import hbs from "./template.hbs?raw";
import FormBlock from "../../core/FormBlock";
import Input from "../input-field";
import Button from "../button";
import ChatsController from "../../controllers/ChatsController";
import InfoMessage from "../info-message";
import closeIcon from "../../resources/icons/close.svg?raw";

type NewChannelProps = {
  show: boolean;
};

class NewChannel extends FormBlock<NewChannelProps> {
  template = hbs;
  chatsController: ChatsController | null = null;

  constructor(props: NewChannelProps) {
    super(props);

    const channelTitle = new Input({
      name: "channelTitle",
      className: ["popup__input"],
      labelClassName: ["popup__label"],
      placeholder: "Название чата",
    });

    const formInfo = new InfoMessage();

    const submitButton = new Button({
      text: "Создать",
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
      channelTitle,
      formInfo,
      submitButton,
    };

    this.events = {
      submit: (event) => {
        if (this.isFormEvent(event)) {
          event.preventDefault();

          const formIsValid = this.formValidate();
          if (!formIsValid) {
            return;
          }

          this.children.submitButton.setProps({ disabled: true });

          const formData = this.getFormData();
          this.chatsController?.newChat(formData.get("channelTitle") as string);
          this.setProps({ show: false });
        }
      },
    };
  }

  protected componentDidMount(): void {
    super.componentDidMount();

    this.chatsController = new ChatsController();

    // сбрасываем значение ввода
    const input = this.children.channelTitle.getRef(
      "input",
    ) as HTMLInputElement;
    if (input) {
      input.value = "";
    }

    // подписка на стор: слушаем ошибки формы
    this.formErrorListener({
      formKey: "chatSettings",
      submitBtn: this.children.submitButton as Button,
      formInfo: this.children.formInfo as InfoMessage,
    });
  }
}

export default NewChannel;
