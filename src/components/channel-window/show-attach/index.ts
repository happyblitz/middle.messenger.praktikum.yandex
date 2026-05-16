import Block from "../../../utils/Block";
import Button from "../../button";
import cancelIcon from "../close.svg?raw";
import hbs from "./template.hbs?raw";

type ShowAttachProps = {
  filename?: string;
  onClick?: () => void;
};

class ShowAttach extends Block<ShowAttachProps> {
  template = hbs;
  attachFieldName = "attach";

  constructor(props: ShowAttachProps = {}) {
    super(props);

    const cancelButton = new Button({
      text: cancelIcon,
      className: ["channel__footer-attached-cancel", "icon"],
      ariaLabel: "удалить",
      title: "удалить",
      onClick: this.props.onClick,
    });

    this.children = {
      cancelButton,
    };
  }
}

export default ShowAttach;
