import isPlainObject from "./isPlainObject";
import cloneDeep from "./cloneDeep";

/**
 * merge
 * lhs - стор с общими данными
 * rhs - новые данные в стор, например информация о пользователе или список чатов
 *
 * идея такая, если в сторе нет ключа - добавляем,
 * если есть и это данные, а не новый объект - обновляем целиком
 */
function merge<T = unknown>(lhs: T, rhs: T): T {
  if (isPlainObject(lhs) && isPlainObject(rhs)) {
    const finalObj = cloneDeep(lhs) as Record<string, unknown>;
    for (const [k, v] of Object.entries(rhs)) {
      finalObj[k] = k in finalObj ? merge(lhs[k], rhs[k]) : cloneDeep(v);
    }
    return finalObj as T;
  }

  return cloneDeep(rhs);
}

export default merge;
