import FormValidator from "../utils/validation/FormValidator";
import type { FormFields } from "../utils/validation/FormValidator";

class Controller {
  /**
   * Валидирует форму
   * Возвращает объект с данными формы и ошибками
   * Удаляет из результата файлы
   * @param formData
   * @returns
   */
  protected formValidate(formData: FormData) {
    // преобразование и валидация данных
    const fields: FormFields = {};

    formData.forEach((value, fieldName) => {
      if (value instanceof File) {
        fields[fieldName] = { value: value.name };
      } else {
        const fieldValue = this.fieldPrepair(value);
        fields[fieldName] = { value: fieldValue };
      }
    });

    const errors = FormValidator.validateForm(fields, { strict: true });

    const data = Object.fromEntries(
      Object.entries(fields).map(([key, { value }]) => [key, value]),
    );

    return { data, errors };
  }

  protected fieldPrepair(value: string) {
    return value.trim();
  }
}

export default Controller;
