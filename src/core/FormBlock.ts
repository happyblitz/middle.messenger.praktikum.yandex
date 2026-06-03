import Block from "./Block";
import Button from "../components/button";
import InfoMessage from "../components/info-message";
import FormValidator from "../utils/validation/FormValidator";
import Controller from "./Controller";
import store from "./Store";
import type { FormErrorState } from "./Store";
import type { FormValidateArgs } from "../utils/validation/FormValidator";
import type { FormFields } from "../utils/validation/FormValidator";
import { isEventInForm } from "../utils/Dom";

// Строгий интерфейс для компонента-поля формы
interface FormComponent extends Block<object> {
  getFormElementInfo: () => { name: string; type: string };
  getFormElementValue: () => string;
  setFormElementError: (error: string) => void;
}

type ValidateArgs = FormValidateArgs & { setError?: boolean };

// FormComponent Type Guard
function isFormComponent(child: Block<object>): child is FormComponent {
  return (
    child.isFormElement === true &&
    "getFormElementInfo" in child &&
    typeof child.getFormElementInfo === "function" &&
    "getFormElementValue" in child &&
    typeof child.getFormElementValue === "function" &&
    "setFormElementError" in child &&
    typeof child.setFormElementError === "function"
  );
}

type FormErrorListener = {
  formKey: keyof FormErrorState;
  submitBtn?: Button | null;
  formInfo?: InfoMessage | null;
};

abstract class FormBlock<Props extends object> extends Block<Props> {
  controller: Controller | null = null;
  registeredFields: Record<string, { type: string; component: FormComponent }> =
    {};

  /**
   * регистрируем все элементы формы
   * у элемента должно быть выставлено свойство isFormElement
   * а также быть реализованы методы:
   * getFormElementInfo(), getFormElementValue(), setFormElementError(errorText)
   *
   * @WARNING для упрощения считаем,
   * что компоненты формы не могут размонтироваться и примонтироваться "внезапно",
   * иначе стоит всем дочерним элементам в пропсах пробрасывать ссылку на родителя
   * и при размонтировании по этой ссылке искать FormBlock
   */
  protected componentDidMount(): void {
    this.registeredFields = Object.fromEntries(
      this.collectFormElements(this.children),
    );

    super.componentDidMount();
  }

  protected componentWillUnmount(): void {
    this.destroy();

    super.componentWillUnmount();
  }

  /**
   * Здесь будем делать отписку от сокетов,
   * удаление всяких таймеров конроллера и т.д.
   */
  protected destroy() {}

  protected collectFormElements(children: Record<string, Block<object>>) {
    let elements: [string, { type: string; component: FormComponent }][] = [];
    for (const child of Object.values(children)) {
      // добавляем сам элемент
      if (isFormComponent(child)) {
        const { name, type } = child.getFormElementInfo();
        elements.push([name, { type, component: child }]);
      }

      // рекурсивно обходим дочерние элементы этого элемента
      if (Object.keys(child.children).length > 0) {
        elements.push(...this.collectFormElements(child.children));
      }
    }

    return elements;
  }

  /**
   * Валидирует поля формы или одно конкретное поле
   * @param inputName Имя валидируемого поля. Если пусто, валидируются все поля.
   * @param setError Отобразить ошибку валидации или нет
   * @param strict Валидировать пустое поле или нет
   * @return boolean
   */
  protected formValidate(options: ValidateArgs = {}): boolean {
    const { fieldName = "", setError = true, strict = true } = options;

    // получаем значения всех зарегистрированных элементов формы
    const fields: FormFields = {};
    for (const key of Object.keys(this.registeredFields)) {
      fields[key] = {
        type: this.registeredFields[key].type,
        value: this.registeredFields[key].component.getFormElementValue(),
      };
    }

    // получаем результат валидации
    const errors = FormValidator.validateForm(fields, { fieldName, strict });

    // очищаем/выставляем ошибки для всех обрабатываемых полей
    if (setError) {
      if (fieldName) {
        const errorText = errors[fieldName] ?? "";
        this.registeredFields[fieldName].component.setFormElementError(
          errorText,
        );
      } else {
        Object.keys(fields).forEach((field) => {
          const errorText = errors[field] ?? "";
          this.registeredFields[field].component.setFormElementError(errorText);
        });
      }
    }

    return Object.keys(errors).length === 0;
  }

  /**
   * Следит за ошибка валидации и отправки формы через стор
   * @param storeErrorKey
   */
  protected formErrorListener(params: FormErrorListener) {
    const { formKey, submitBtn = null, formInfo = null } = params;

    const unsibscribe = store.subscribe({
      action: (state) => {
        // общая ошибка
        if (formInfo && state.errors?.form?.[formKey]?.form) {
          formInfo.setProps({
            text: state.errors.form[formKey].form,
            error: true,
          });
          store.setStateByPath(`errors.form.${formKey}.form`, null);
        }

        // ошибки валидации полей
        if (state.errors?.form?.[formKey]?.fields) {
          const errors = state.errors.form[formKey].fields;
          this.fieldsSetErrors(errors);
          store.setStateByPath(`errors.form.${formKey}.fields`, null);
        }

        if (submitBtn) {
          submitBtn.setProps({ disabled: false });
        }
      },
      observer: (state) => [
        state.errors?.form?.[formKey]?.form,
        state.errors?.form?.[formKey]?.fields,
      ],
    });

    this.unsubscribers.push(unsibscribe);
  }

  /**
   * Выставляет ошибки в input поля формы
   * @param errors
   */
  protected fieldsSetErrors(errors: Record<string, string>) {
    Object.entries(errors).forEach(([fieldName, errorText]) => {
      this.registeredFields[fieldName].component.setFormElementError(errorText);
    });
  }

  protected formSuccessMessage(formInfo: InfoMessage) {
    formInfo.setProps({
      text: "сохранено",
      error: false,
      success: true,
      className: "center",
    });
  }

  /**
   * Собрать данные формы
   * @returns FormData instance
   */
  protected getFormData(formRef = "form") {
    const form = this.getRef(formRef) as HTMLFormElement;
    return new FormData(form);
  }

  /**
   * Проверяет что все поля формы заполнены
   */
  protected allFieldsFilled() {
    const fields: Record<string, string> = {};
    for (const fieldName of Object.keys(this.registeredFields)) {
      fields[fieldName] =
        this.registeredFields[fieldName].component.getFormElementValue();
    }

    return FormValidator.allFieldsFilled(fields);
  }

  protected isFormEvent(event: Event, formRef = "form") {
    const form = this.getRef(formRef);
    return isEventInForm(event, form);
  }
}

export default FormBlock;
