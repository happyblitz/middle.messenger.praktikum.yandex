import Controller from "../core/Controller";
import store from "../core/Store";
import chatsApi from "../api/ChatsApi";

class ChatsController extends Controller {
  /**
   * Получает список чатов
   * @returns
   */
  public async chats() {
    const response = await chatsApi.chats();

    console.log("chats", response);

    if (response?.reason) {
      store.setState({
        errors: { getChats: response },
      });
      return;
    }

    store.setState({
      chats: response,
    });
  }
}

export default ChatsController;
