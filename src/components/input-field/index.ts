import Block from "../../core/Block";
import hbs from "./template.hbs?raw";
import InfoMessage from "../info-message";

type InputProps = {
  name: string;
  label?: string;
  labelClassName?: string[];
  type?: string;
  value?: string;
  autocomplete?: string;
  placeholder?: string;
  className?: string[];
  errorText?: string;
  id?: string;
  accept?: string;
  formName?: string;
  onFocusout?: ((e: Event) => void) | (() => void);
  onChange?: ((e: Event) => void) | (() => void);
  onInput?: ((e: Event) => void) | (() => void);
};

class Input extends Block<InputProps> {
  template = hbs;

  constructor(props: InputProps) {
    super(props);

    this.isFormElement = true;

    this.children = {};

    this.events = {
      focusout: this.props.onFocusout,
      change: this.props.onChange,
      input: this.props.onInput,
    };
  }

  protected beforeCompile() {
    if (this.props.errorText) {
      const inputErrorState = {
        text: this.props.errorText,
        error: true,
      };

      if (this.children.inputError) {
        this.children.inputError.setProps(inputErrorState);
      } else {
        this.children.inputError = new InfoMessage(inputErrorState);
      }
    } else {
      delete this.children.inputError;
    }
  }

  public getFormElementInfo() {
    return {
      ...(this.props.formName ? { formName: this.props.formName } : null),
      name: this.props.name,
      type: this.props.type ?? "text",
    };
  }

  public getFormElementValue() {
    return (this.getRef("input") as HTMLInputElement).value;
  }

  public setFormElementError(errorText: string) {
    this.setProps({
      errorText,
      value: (this.getRef("input") as HTMLInputElement).value,
    });
  }
}

export default Input;
