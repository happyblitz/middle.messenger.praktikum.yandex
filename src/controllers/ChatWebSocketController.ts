import WebSocketClient from "../core/WebSocketClient";
import chatApi from "../api/ChatApi";
import type { User } from "../core/Store";
import store from "../core/Store";
import type { Message } from "../core/Store";

class ChatWebSocketController {
  private user: User = store.getState().user as User;
  private chatId: number;
  private token: string = "";
  private socketClient: WebSocketClient | null = null;
  private listeners: (() => void)[] = [];

  constructor(chatId: number) {
    this.chatId = chatId;
  }

  /**
   * Инициализация
   * @returns
   */
  public async init() {
    this.token = (await this.getToken()) as string;

    if (!this.token) {
      return;
    }

    await this.connect();
    this.subscribe();
  }

  /**
   * Открываем соединение
   */
  protected connect(): Promise<void> {
    return new Promise((resolve) => {
      const url = `/chats/${this.user.id}/${this.chatId}/${this.token}`;
      this.socketClient = new WebSocketClient(url);

      this.socketClient.onOpen(() => {
        resolve();
      });
    });
  }

  /**
   * Переподключение
   */
  protected reconnect() {
    this.unsubscribe();

    setTimeout(() => {
      this.init();
    }, 1000); // Пауза перед переподключением
  }

  /**
   * Закрываем соединение
   */
  public unmount() {
    this.unsubscribe();
    this.socketClient?.disconnect();
  }

  /**
   * Подписываемся на события
   */
  protected subscribe() {
    const messageListener = this.socketClient!.onMessage((e) => {
      const event = e as MessageEvent;
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        this.newMessages(data);
      } else {
        this.newMessage(data);
      }
    });
    this.listeners.push(messageListener);

    const errorListener = this.socketClient!.onError((event) => {
      const e = event as ErrorEvent;
      store.setStateByPath(`errors.webSocket.${this.chatId}`, e.message);
    });
    this.listeners.push(errorListener);

    const closeListener = this.socketClient!.onClose((e) => {
      if (!(e as CloseEvent).wasClean) {
        this.reconnect(); // Обрыв соединения
      }
    });
    this.listeners.push(closeListener);
  }

  /**
   * Отписываемся от событий
   */
  protected unsubscribe() {
    this.listeners.forEach((u) => u());
  }

  /**
   * Полчаем токен
   * @returns
   */
  protected async getToken() {
    const response = await chatApi.getToken(this.chatId);

    if (response?.reason) {
      store.setState({
        errors: { getChatToken: response },
      });
      return "";
    }

    return response.token;
  }

  /**
   * Возвращает id чата этого контроллера
   * @returns
   */
  public getChatId() {
    return this.chatId;
  }

  /**
   * Отправляем сообщение
   * @param message
   * @param type
   */
  public send(content: string, type: string = "message") {
    this.socketClient?.send(
      JSON.stringify({
        content,
        type,
      }),
    );
  }

  /**
   * Получаем последние сообщения
   * @offset С какого сообщения нужно отдать ещё 20
   */
  public getMessages() {
    const offset = store.getState().messages[this.chatId]?.length ?? 0;

    this.socketClient?.send(
      JSON.stringify({
        content: offset.toString(),
        type: "get old",
      }),
    );
  }

  /**
   * сохраняет одиночное сообщение в стор
   * @param data
   */
  protected newMessage(data: Message) {
    const storeMessages = store.getState().messages?.[this.chatId] ?? [];
    const messages = [...storeMessages, data];
    store.setStateByPath(`messages.${this.chatId}`, messages);
  }

  /**
   * сохраняем множество сообщений в стор
   * @param data
   */
  protected newMessages(data: Message[]) {
    const storeMessages = store.getState().messages?.[this.chatId] ?? [];
    const messages = [...data.toReversed(), ...storeMessages];
    store.setStateByPath(`messages.${this.chatId}`, messages);
  }

  /**
   * Удаляем сообщения из стора
   */
  clearMessages() {
    store.deleteState(`messages.${this.chatId}`);
  }
}

export default ChatWebSocketController;
