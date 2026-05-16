import Block from "../../utils/Block";
import hbs from "./template.hbs?raw";
import InputError from "../input-error";

type InputProps = {
  label?: string;
  labelClassName?: string[];
  name: string;
  type?: string;
  value?: string;
  autocomplete?: string;
  placeholder?: string;
  className?: string[];
  errorText?: string;
  id?: string;
  accept?: string;
  withError?: boolean;
};

class Input extends Block<InputProps> {
  template = hbs;

  constructor(props: InputProps) {
    super(props);

    const withError = this.props.withError ?? true;

    if (withError) {
      this.children = {
        inputError: props.errorText
          ? new InputError({ text: props.errorText })
          : new InputError(),
      };
    }
  }
}

export default Input;
