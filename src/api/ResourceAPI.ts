import Api from "./API";

class ResourceApi extends Api {
  constructor() {
    super("/resources");
  }

  /**
   * Загружаем файл на сервер
   * @returns
   */
  resources(formData: FormData) {
    return this.post("", { data: formData });
  }
}

const resourceApi = new ResourceApi();

export default resourceApi;
