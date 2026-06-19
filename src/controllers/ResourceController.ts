import Controller from "../core/Controller";
import resourceApi from "../api/ResourceAPI";
import store from "../core/Store";

class ResourceController extends Controller {
  /**
   * Загружаем файл на сервер
   * @returns
   */
  public async newResource(formData: FormData) {
    const attach = formData.get("resource") as File;

    if (attach.size && attach.size > 0) {
      const response = await resourceApi.resources(formData);

      if (response?.reason) {
        store.setState({
          errors: { uploadFiles: { [attach.name]: response } },
        });
        return;
      }

      store.setState({
        response: { uploadFiles: { [attach.name]: response } },
      });
    }
  }

  /**
   * Файл был обработан и большене нужен
   * @param fileName
   */
  fileWasProcessed(fileName: string) {
    store.deleteState(`response.uploadFiles.${fileName}`);
  }
}

export default ResourceController;
