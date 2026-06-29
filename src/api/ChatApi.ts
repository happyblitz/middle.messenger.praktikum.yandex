import Api from "./API";

class ChatApi extends Api {
  constructor() {
    super("/chats");
  }

  /**
   * получить список чатов
   * @returns
   */
  chats() {
    return this.get();
  }

  /**
   * создать новый чат
   * @returns
   */
  createChat(data: Record<string, unknown>) {
    return this.post("", { data });
  }

  /**
   * удаляет чат
   * @returns
   */
  deleteChat(chatId: number) {
    return this.delete("", { data: { chatId } });
  }

  /**
   * добавить в чат пользователей
   * @returns
   */
  addUsers(data: Record<string, unknown>) {
    return this.put("/users", { data });
  }

  /**
   * добавить в чат пользователей
   * @returns
   */
  deleteUsers(data: Record<string, unknown>) {
    return this.delete("/users", { data });
  }

  /**
   * получить пользователей чата
   * @returns
   */
  getUsers(id: number) {
    return this.get(`/${id}/users`);
  }

  /**
   * получить токен чата
   * @param chatId
   */
  getToken(chatId: number) {
    return this.post(`/token/${chatId}`);
  }
}

const chatApi = new ChatApi();

export default chatApi;
