import Block from "../../../core/Block";
import Button from "../../button";
import { fixedModalClass } from "../../../utils/Globals";
import { cssModalClosedClass } from "../../../utils/Globals";
import hbs from "./template.hbs?raw";
import closeIcon from "./close.svg?raw";
import "./styles.scss";

type ProfileFooterProps = {
  onDeepClose: (() => void) | null;
};

class ProfileFooter extends Block<ProfileFooterProps> {
  template = hbs;

  constructor(props: ProfileFooterProps) {
    super(props);

    const closeButton = new Button({
      text: closeIcon,
      ariaLabel: "Закрыть",
      title: "Закрыть",
    });

    this.children = {
      closeButton,
    };

    this.events = {
      click: () => {
        // обработчик закрытия модального окна
        const element = this.element() as HTMLElement;
        const modal = element.closest("." + fixedModalClass);
        if (modal) {
          modal.classList.add(cssModalClosedClass);
        }

        this.props.onDeepClose?.();
      },
    };
  }
}

export default ProfileFooter;
