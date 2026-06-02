import Block from "../../core/Block";
import hbs from "./template.hbs?raw";

type InfoMessageProps = {
  text?: string;
  error?: boolean;
  success?: boolean;
  className?: string[];
};

class InfoMessage extends Block<InfoMessageProps> {
  template = hbs;
}

export default InfoMessage;
