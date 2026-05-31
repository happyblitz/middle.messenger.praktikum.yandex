import isEqual from "../utils/functions/isEqual";
import merge from "../utils/functions/merge";
import set from "../utils/functions/set";

/**
 * результат сравнения Observer(текущий стор) vs Observer(новый стор)
 * определяет, затрагивают ли изменения в стор этот компонент
 */
type Observer = (state: StoreSate) => unknown;

/**
 * @param action - функция, исполняемая при изменении актуальных данных в стор для компонента
 * @param observer - генерирует объект сравнения состояния (старые данные vs новые данные)
 * @param currentState - результат функции Observer(текущий стор), создается во время подписки
 */
type Listener = {
  action: (state: StoreSate) => void;
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
type StoreSate = {
  isAuthorized: boolean;
  user?: Record<string, unknown>;
  avatar?: string;
  errors?: {
    formRegister?: FormErrors;
  };
};

class Store {
  private state: StoreSate = { isAuthorized: false };
  private listeners: listeners = new Set();

  public getState() {
    return this.state;
  }

  public isAuthorized() {
    return this.state.isAuthorized;
  }

  /**
   * Изменяет состояние стора
   * @param newState Объект с новым состоянием
   */
  public setState(newState: Record<string, unknown>) {
    this.state = merge(this.state, newState) as StoreSate;
    // Уведомляем всех подписчиков об изменении
    this.emit();
  }

  /**
   * Изменяет/добавляет единичное значение стора
   * @param path Путь к вложенному свойству
   * @param value Выставляемое значение
   */
  public setStateByPath(path: string, value: unknown) {
    this.state = set(this.state, path, value) as StoreSate;
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
  }
}

const store = new Store();

export default store;
