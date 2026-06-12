import Controller from "../core/Controller";
import store from "../core/Store";
import chatsApi from "../api/ChatsApi";
import type { Chat } from "../core/Store";
import { delay } from "../utils/Globals";

class ChatsController extends Controller {
  formId = "chatSettings";

  /**
   * Получаем список чатов
   * @returns
   */
  public async chats() {
    const response = await chatsApi.chats();

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

  /**
   * создаем новый чат
   * @param title
   * @returns
   */
  public async newChat(title: string) {
    const response = await chatsApi.createChat({
      title,
    });

    if (response?.reason) {
      this.setFormError(response.reason as string);
      return;
    }

    // обновляем список чатов влюбом случае
    await this.chats();

    // выставляем текущий чат
    store.setStateByPath("data.newChatId", Number(response.id));
  }

  /**
   * Выставляем ошибку формы
   * @param errorText
   */
  protected setFormError(errorText: string) {
    store.setStateByPath(`errors.form.${this.formId}.fields`, errorText);
  }

  /**
   * Запрашивает у сервера список пользователей чата
   * @param chatId
   * @returns
   */
  protected async chatUsersRequest(chatId: number) {
    const response = await chatsApi.getUsers(chatId);

    if (response?.reason) {
      store.setStateByPath(`errors.getChatUsers`, response.reason);
      return false;
    }

    return response;
  }

  /**
   * Сохраняем список участников чата
   * @param chat
   * @param users
   * @returns
   */
  public async setChatUsers(chat: Chat, users: number[]) {
    // получаем список пользователей чата
    const chatUsersList = await this.chatUsersRequest(chat.id);

    if (chatUsersList === false) {
      return;
    }

    if (!Array.isArray(chatUsersList)) {
      return;
    }

    // не трогаем самого пользователя,
    // уберем его из списка
    const currentUserId = store.getState().user?.id as number;
    const chatUsers = chatUsersList
      .map((u) => u.id)
      .filter((uid) => uid !== currentUserId);

    // добавляем новых пользователей
    const newUsers = users.filter((uid) => !chatUsers.includes(uid));
    this.chatAddUsers(chat.id, newUsers);

    // удаляем пользователей
    const delUsers = chatUsers.filter((uid) => !users.includes(uid));
    this.chatDeleteUsers(chat.id, delUsers);

    // обновляем стор
    // у Яндекса задержка, сразу обновленные данные не отдаст
    // если там сервер не один, возможно за это время он их дублирует на остальные
    await delay(2000);
    this.storeUpdateUsers(chat.id);
  }

  /**
   * добавляем в чат пользователей
   * @param chatId
   * @param users
   * @returns
   */
  public async chatAddUsers(chatId: number, users: number[]) {
    if (users.length === 0) {
      return true;
    }

    const response = await chatsApi.addUsers({
      users,
      chatId,
    });

    if (response?.reason) {
      this.setFormError(response.reason as string);
      return false;
    }

    return true;
  }

  /**
   * удаляем пользователей из чата
   * @param chatId
   * @param users
   * @returns
   */
  public async chatDeleteUsers(chatId: number, users: number[]) {
    if (users.length === 0) {
      return true;
    }

    const response = await chatsApi.deleteUsers({
      users,
      chatId,
    });

    if (response?.reason) {
      this.setFormError(response.reason as string);
      return false;
    }

    return true;
  }

  /**
   * Запрашиваем список пользователей и обновляем стор
   * @param chatId
   */
  protected async storeUpdateUsers(chatId: number) {
    const users = await this.chatUsersRequest(chatId);

    if (users) {
      store.setState({
        chatUsers: { [chatId]: users },
      });
    }
  }

  /**
   * Получаем список пользователей чата
   * @param chatId
   */
  public async getChatUsers(chatId: number) {
    const chatUsers = store.getState().chatUsers?.[chatId];
    if (chatUsers) {
      return;
    }

    this.storeUpdateUsers(chatId);
  }
}

export default ChatsController;
