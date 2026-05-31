/**
 * cloneDeep
 * Напишите функцию, которая выполняет глубокое копирование значений.
 */

import isPlainObject from "./isPlainObject";

function cloneDeep<T>(data: T): T {
  // Обработка массивов
  if (Array.isArray(data)) {
    return data.map((v) => cloneDeep(v)) as unknown as T;
  }

  // Обработка Date
  if (data instanceof Date) {
    return new Date(data.getTime()) as unknown as T;
  }

  // Обработка Set
  if (data instanceof Set) {
    const copy = new Set();
    data.forEach((v) => copy.add(cloneDeep(v)));
    return copy as unknown as T;
  }

  // Обработка Map
  if (data instanceof Map) {
    const copy = new Map();
    data.forEach((v, k) => copy.set(k, cloneDeep(v)));
    return copy as unknown as T;
  }

  // Простые объекты
  if (isPlainObject(data)) {
    const copy: Record<string | symbol, unknown> = {};
    for (const k of Reflect.ownKeys(data)) {
      const value = (data as Record<string | symbol, unknown>)[k];
      copy[k] = cloneDeep(value);
    }
    return copy as unknown as T;
  }

  return data;
}

export default cloneDeep;
