import Block from "../../utils/Block";
import hbs from "./template.hbs?raw";

type TextAreaProps = {
  name: string;
  placeholder?: string;
  className?: string[];
};

class TextArea extends Block<TextAreaProps> {
  template = hbs;
}

export default TextArea;
