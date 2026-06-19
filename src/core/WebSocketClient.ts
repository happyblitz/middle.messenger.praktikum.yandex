import { WEBSOCKET_BASE_URL } from "../scripts/api.settings";

type SocketCallback = (event: Event) => void;

type listeners = Partial<
  Record<"open" | "message" | "close" | "error", Set<SocketCallback>>
>;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: listeners = {};

  constructor(url: string) {
    this.connect(url);

    ["open", "close", "message", "error"].forEach((eventName) => {
      this.socket?.addEventListener(eventName as keyof listeners, (event) => {
        const key = eventName as keyof listeners;
        if (this.listeners[key]) {
          this.listeners[key].forEach((listener) => listener(event));
        }
      });
    });
  }

  connect(url: string) {
    this.socket = new WebSocket(WEBSOCKET_BASE_URL + url);
  }

  disconnect() {
    this.socket?.close();
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
