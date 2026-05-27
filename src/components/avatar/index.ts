import Block from "../../core/Block";
import hbs from "./template.hbs?raw";
import "./styles.scss";

type AvatarProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string[];
  onClick?: (e?: Event) => void;
};

class Avatar extends Block<AvatarProps> {
  template = hbs;

  constructor(props: AvatarProps) {
    const defaults = {
      alt: "аватар",
      width: 50,
      height: 50,
    };

    super({ ...defaults, ...props });

    this.events = {
      click: this.props.onClick,
    };
  }
}

export default Avatar;
