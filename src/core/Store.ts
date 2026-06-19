import isEqual from "../utils/functions/isEqual";
import merge from "../utils/functions/merge";
import set from "../utils/functions/set";
import deleteDeep from "../utils/functions/deleteDeep";

/**
 * результат сравнения Observer(текущий стор) vs Observer(новый стор)
 * определяет, затрагивают ли изменения в стор этот компонент
 */
type Observer = (state: StoreState) => unknown;

/**
 * @param action - функция, исполняемая при изменении актуальных данных в стор для компонента
 * @param observer - генерирует объект сравнения состояния (старые данные vs новые данные)
 * @param currentState - результат функции Observer(текущий стор), создается во время подписки
 */
type Listener = {
  action: (state: StoreState) => void;
  observer: Observer;
  currentState?: unknown;
};

type listeners = Set<Listener>;

type FormErrors = {
  form?: string;
  fields?: Record<string, string>;
};

/**
 * Ключи стора
 */
export type StoreState = {
  isAuthorized: boolean;
  chats: Chat[];
  messages: Record<number, Message[]>;
  user: User | null;
  errors?: {
    form?: FormErrorState;
    getUser?: unknown;
    getChats?: unknown;
    getChatUsers?: unknown;
    logout?: unknown;
    deleteChat?: unknown;
    uploadFiles?: Record<string, unknown>;
    webSocket?: Record<number, unknown>;
  };
  response?: {
    form?: {
      changePassword?: unknown;
    };
    uploadFiles?: Record<string, UploadFile>;
  };
  data?: {
    userSearch?: {
      requestId: number;
      users: User[];
    };
    newChatId?: number;
  };
  chatUsers?: ChatUsers;
};

export type ChatUsers = Record<string, User[]>;

export type User = {
  id: number;
  first_name: string;
  second_name: string;
  avatar: string | null;
  display_name: string | null;
  login: string;
  email?: string;
  phone?: string;
  role?: string;
};

export type Chat = {
  id: number;
  title: string;
  avatar?: string | null;
  unread_count?: number;
  created_by?: number;
  last_message?: {
    user: User;
    time: string;
    content: string;
  };
};

export type Message = {
  content: string;
  type: string;
  time: string;
  user_id: number;
  id: number;
  file?: UploadFile;
  is_read?: boolean;
  chat_id: number;
};

export type UploadFile = {
  id: number;
  user_id: number;
  path: string;
  filename: string;
  content_type: string;
  content_size: number;
  upload_date: string;
};

export type FormErrorState = Partial<
  Record<
    | "register"
    | "login"
    | "profile"
    | "changePassword"
    | "avatar"
    | "chatSettings",
    FormErrors
  >
>;

class Store {
  private state: StoreState = {
    isAuthorized: false,
    chats: [],
    user: null,
    messages: {},
  };
  private listeners: listeners = new Set();

  public getState() {
    return this.state;
  }

  /**
   * @returns Авторизован пользователь или нет
   */
  public isAuthorized() {
    return this.state.isAuthorized;
  }

  /**
   * Изменяет состояние стора
   * @param newState Объект с новым состоянием
   */
  public setState(newState: Record<string, unknown>) {
    this.state = merge(this.state, newState) as StoreState;

    // Уведомляем всех подписчиков об изменении
    this.emit();
  }

  /**
   * Изменяет/добавляет единичное значение стора
   * @param path Путь к вложенному свойству
   * @param value Выставляемое значение
   */
  public setStateByPath(path: string, value: unknown) {
    this.state = set(this.state, path, value) as StoreState;
    // Уведомляем всех подписчиков об изменении
    this.emit();
  }

  /**
   * Удаляет элемент из стора
   * @param path Путь к вложенному свойству
   */
  public deleteState(path: string) {
    deleteDeep(this.state, path);

    // Уведомляем всех подписчиков об изменении
    this.emit();
  }

  public subscribe(newListener: Listener): () => void {
    const listener = {
      ...newListener,
      currentState: newListener.observer(this.state),
    };
    this.listeners.add(listener);

    // Возвращаем функцию для отписки
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** оповещение слушателей при условии, что отслеживаемое состояние изменилось */
  private emit() {
    this.listeners.forEach((listener) => {
      const newState = listener.observer(this.state);
      if (!isEqual(newState, listener.currentState)) {
        listener.currentState = newState;
        listener.action(this.state);
      }
    });

    console.log("emit", this.state);
  }
}

const store = new Store();

export default store;
