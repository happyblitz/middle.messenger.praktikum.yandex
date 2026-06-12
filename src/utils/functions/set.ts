import isPlainObject from "./isPlainObject";
import merge from "./merge";

type Indexed = Record<string, unknown>;

/**
 * Получает путь к вложенному свойству объекта
 * и устанавливает значение в это свойство.
 * Если поля не существует, то оно будет создано по указанному пути.
 * set({ foo: 5 }, "bar.baz.buz", 10); // { foo: 5, bar: { baz: { buz: 10 }}}
 * set({ foo: 1 }, "foo", 2); // { foo: 2 }
 * @param object Простой объект для вставки данных
 * @param path Путь к вложенному свойству объекта
 * @param value Вставляемое значение
 * @returns
 */
function set(
  object: Indexed | unknown,
  path: string,
  value: unknown,
): Indexed | unknown {
  if (!isPlainObject(object)) {
    return object;
  }

  if (typeof path !== "string") {
    throw new Error("path must be string");
  }

  const bricks = path.split(".");

  const obj = bricks.reduceRight((acc, key) => {
    return { [key]: acc };
  }, value);

  return merge(object as Indexed, obj);
}

export default set;
