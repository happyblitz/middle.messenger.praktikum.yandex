import validateField from "./Validator";

class FormValidator {
  //formErrors: Record<string, string | null> = {};
  //formIsValid: boolean = false;

  static validateInput(name: string, value: string, strict = true): string {
    const trimValue = value.trim();

    if (!trimValue && !strict) {
      return "";
    }

    return validateField(name, trimValue) || "";
  }

  static validateConPassField(
    passValue: string,
    conPassValue: string,
    strict = true,
  ) {
    const trimPassValue = passValue.trim();
    const trimConPassValue = conPassValue.trim();

    if (strict || trimConPassValue) {
      return trimPassValue === trimConPassValue ? "" : "Пароли не совпадают";
    }

    return "";
  }

  /*
  public observeFormData(rawData: Record<string, string>) {
    const data = this.prepareData(rawData);
    this.validateData(data);
    this.formIsValid = Object.entries(this.formErrors).every(([, value]) => [
      value === null,
    ]);
    return data;
  }

  public prepareData(rawData: Record<string, string>) {
    for (const key in rawData) {
      if (typeof rawData[key] === "string") {
        rawData[key] = rawData[key].trim();
      }
    }

    return rawData;
  }

  public validateData(data: Record<string, string>) {
    this.formErrors = Object.fromEntries(
      Object.entries(data).map(([fieldName, value]) => [
        fieldName,
        validateField(fieldName, value),
      ]),
    );
  }
  */
}

export default FormValidator;
