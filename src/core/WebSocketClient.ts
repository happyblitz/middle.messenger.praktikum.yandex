import { WEBSOCKET_BASE_URL } from "../scripts/api.settings";

type SocketCallback = (event: Event) => void;

const eventNames = ["open", "close", "message", "error"] as const;

type listeners = Partial<
  Record<(typeof eventNames)[number], Set<SocketCallback>>
>;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: listeners = {};
  private nativeListeners: {
    eventName: (typeof eventNames)[number];
    handler: (e: Event) => void;
  }[] = [];

  constructor(url: string) {
    this.connect(url);

    eventNames.forEach((eventName) => {
      const handler = (event: Event) => {
        if (this.listeners[eventName]) {
          this.listeners[eventName].forEach((listener) => listener(event));
        }
      };

      this.socket?.addEventListener(eventName, handler);

      this.nativeListeners.push({ eventName, handler });
    });
  }

  connect(url: string) {
    this.socket = new WebSocket(WEBSOCKET_BASE_URL + url);
  }

  disconnect() {
    // 1. Сохраняем ссылку на сокет
    const activeSocket = this.socket;

    // 2. Сразу обнуляем, чтобы кастомные обработчики не вызывались
    this.socket = null;
    this.listeners = {};

    // 3. Закрываем соединение (браузер вызовет нативные обработчики, но this.listeners уже пуст)
    activeSocket?.close();

    // 4. Удаляем нативные слушатели
    this.nativeListeners.forEach((item) => {
      activeSocket?.removeEventListener(item.eventName, item.handler);
    });
    this.nativeListeners = [];
  }

  send(message: string) {
    this.socket?.send(message);
  }

  onOpen(callback: SocketCallback) {
    return this.subscribe("open", callback);
  }

  onMessage(callback: SocketCallback) {
    return this.subscribe("message", callback);
  }

  onClose(callback: SocketCallback) {
    return this.subscribe("close", callback);
  }

  onError(callback: SocketCallback) {
    return this.subscribe("error", callback);
  }

  protected subscribe(eventName: keyof listeners, callback: SocketCallback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set();
    }

    const eventState = this.listeners[eventName];

    eventState.add(callback);

    return () => {
      eventState.delete(callback);
    };
  }

  getState() {
    return this.socket?.readyState;
  }
}

export default WebSocketClient;
