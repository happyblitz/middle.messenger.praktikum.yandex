import Block from "../../core/Block";
import hbs from "./template.hbs?raw";

type InputErrorProps = {
  text?: string;
};

class InputError extends Block<InputErrorProps> {
  template = hbs;
}

export default InputError;
