import Block from "../../core/Block";
import hbs from "./template.hbs?raw";

type ButtonProps = {
  text: string;
  type?: string;
  className?: string[];
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  onClick?: (e?: Event) => void;
};

class Button extends Block<ButtonProps> {
  template = hbs;

  constructor(props: ButtonProps) {
    super(props);

    this.events = {
      click: (e) => this.props.onClick?.(e),
    };
  }
}

export default Button;
