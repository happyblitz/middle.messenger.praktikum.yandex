import Block from "../../core/Block";
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
  onFocusout?: ((e: Event) => void) | (() => void);
  onChange?: ((e: Event) => void) | (() => void);
};

class Input extends Block<InputProps> {
  template = hbs;

  constructor(props: InputProps) {
    super(props);

    this.isInputComponent = true;

    if (this.props.errorText) {
      this.children = {
        inputError: new InputError({ text: this.props.errorText }),
      };
    }

    this.events = {
      focusout: this.props.onFocusout,
      change: this.props.onChange,
    };
  }

  protected beforeCompile() {
    if (this.props.errorText) {
      if (this.children.inputError) {
        this.children.inputError.setProps({ text: this.props.errorText });
      } else {
        this.children = {
          inputError: new InputError({ text: this.props.errorText }),
        };
      }
    } else {
      delete this.children.inputError;
    }
  }
}

export default Input;
