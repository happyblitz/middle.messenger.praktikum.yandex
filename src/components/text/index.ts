import Block from "../../core/Block";
import hbs from "./template.hbs?raw";

type TextProps = {
  text: string;
  className?: string;
};

class Text extends Block<TextProps> {
  template = hbs;
}

export default Text;
