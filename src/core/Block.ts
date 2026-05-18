import Handlebars from "handlebars";
import FormValidator from "../utils/FormValidator";

export type DomElement = HTMLElement | null;

type EventListType = Partial<
  Record<keyof HTMLElementEventMap, (e: Event) => void>
>;

export type SyncInputsArgs = {
  setProps?: boolean;
  inputName?: string;
  strict?: boolean;
};

abstract class Block<Props extends object> {
  static componentName: string = "block";
  /** Шаблонная строка */
  protected abstract template: string;
  /** Свойства шаблона */
  protected props: Props = {} as Props;
  /** Дом элемент */
  private domElement: DomElement = null;
  /** События */
  protected events: EventListType = {};
  /** Ссылки на элементы */
  protected refs: Record<string, HTMLElement> = {};
  /** Вложенные компоненты */
  protected children: Record<string, Block<object>> = {};
  /** Содержит ли компонент input поле */
  protected isInputComponent?: boolean;

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  /** Вызывается перед компиляцией шаблона */
  protected beforeCompile() {}

  /** Метод компилирования шаблона */
  private compile() {
    this.beforeCompile();

    // создаем заглушки для всех детей
    const context = { ...this.props } as Record<string, unknown>;
    for (const childId in this.children) {
      context[childId] = `<div data-id="${childId}"></div>`;
    }

    const html = Handlebars.compile(this.template)(context);

    const template = document.createElement("template");
    template.innerHTML = html;
    const fragment = template.content;

    this.refs = Array.from(fragment.querySelectorAll("[ref]")).reduce(
      (acc: Record<string, HTMLElement>, element) => {
        const key = element.getAttribute("ref");
        if (key) {
          acc[key] = element as HTMLElement;
        }
        element.removeAttribute("ref");
        return acc;
      },
      {},
    );

    const firstChild = fragment.firstElementChild as HTMLElement | null;

    if (firstChild) {
      for (const [childId, child] of Object.entries(this.children)) {
        Array.from(firstChild.querySelectorAll(`[data-id=${childId}]`)).forEach(
          (element) => {
            const childElement = child.element();
            if (childElement) {
              element.replaceWith(childElement);
            }
          },
        );
      }
    }

    return firstChild;
  }

  /** Метод добавления обработчиков событий на элемент */
  private attachListeners() {
    for (const [eventName, eventCallback] of Object.entries(this.events)) {
      if (typeof eventCallback == "function" && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  /** Метод удаления обработчиков событий на элемент */
  private removeListeners() {
    for (const [eventName, eventCallback] of Object.entries(this.events)) {
      if (typeof eventCallback == "function" && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }

  /** Метод для переопределения в классе-наследнике */
  protected componentDidMount() {}

  /** Метод для общей mount-логики и вызова componentDidMount */
  private mountComponent() {
    /** Вызываем монтирование дочерних элементов */
    Object.values(this.children).forEach((child) => child.mountComponent());
    this.attachListeners();
    this.componentDidMount();
  }

  /** Метод для переопределения в классе-наследнике */
  protected componentWillUnmount() {}

  /** Метод для общей unmount-логики и вызова componentWillUnmount */
  private unmountComponent() {
    if (this.domElement) {
      /** Вызываем очистку в порядке, обратном созданию */
      Object.values(this.children)
        .reverse()
        .forEach((child) => child.unmountComponent());
      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  /** Метод отрисовки элемента на странице */
  protected render() {
    this.unmountComponent();
    const fragment = this.compile();

    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }

  public setProps(props: Partial<Props>) {
    // правльно сработает только для примитивов
    // если среди пропсов затисался массив или объект вернет true
    // пока этого хватит
    const hasChanges = Object.entries(props).some(
      ([key, value]) => this.props[key as keyof Props] !== value,
    );

    if (hasChanges) {
      this.props = { ...this.props, ...props };
      this.render();
    }
  }

  /**
   * Валидирует input поля
   * @param setProps Пересобрать инпут блок или нет
   * @param inputName Имя валидируемого поля, если пусто, валидируются все поля
   * @param strict Если true пустое поле = ошибка, иначе пропуск поля
   */
  protected syncInputsState({
    setProps = true,
    inputName = "",
    strict = true,
  }: SyncInputsArgs = {}): boolean {
    const inputs = Object.values(this.children).filter(
      (child) =>
        child.isInputComponent === true &&
        (inputName === "" ||
          inputName === (child.getRef("input") as HTMLInputElement).name),
    );

    let isValid = true;

    for (const inputBlock of inputs) {
      const input = inputBlock.getRef("input") as HTMLInputElement;

      const errorText = FormValidator.validateInput(
        input.name,
        input.value,
        strict,
      );

      if (!setProps && errorText) {
        return false;
      }

      if (errorText) {
        isValid = false;
      }

      if (setProps) {
        inputBlock.setProps({
          errorText,
          value: input.value,
        });
      }
    }

    return isValid;
  }

  public element() {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }

  public getRef(name: string) {
    return this.refs[name];
  }

  public forceUnmounComponent() {
    this.unmountComponent();
  }
}

export default Block;
