import Block from "./Block";
import FormValidator from "../utils/validation/FormValidator";

export type SyncInputsArgs = {
  setProps?: boolean;
  inputName?: string;
  strict?: boolean;
};

abstract class FormBlock<Props extends object> extends Block<Props> {
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
}

export default FormBlock;
