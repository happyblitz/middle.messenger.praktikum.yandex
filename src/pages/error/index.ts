import Block from "../../core/Block";
import hbs from "./template.hbs?raw";
import "./styles.scss";

class ErrorPage extends Block<{}> {
  template = hbs;
}

export default ErrorPage;
