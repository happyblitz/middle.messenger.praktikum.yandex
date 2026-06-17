import isPlainObject from "./isPlainObject";

type Indexed = Record<string, unknown>;

/**
 * Получает путь к вложенному свойству объекта
 * и удаляет это свойство.
 * deleteDeep({ bar: { baz: 4 }}, "bar.baz"); // { bar: {}}
 * @param object Простой объект для вставки данных
 * @param path Путь к вложенному свойству объекта
 * @returns
 */
function deleteDeep(object: Indexed | unknown, path: string): void {
  if (!isPlainObject(object)) {
    return;
  }

  if (typeof path !== "string" || path === "") {
    throw new Error("path must be not empty string");
  }

  const bricks = path.split(".");
  const lastKey = bricks.pop();

  let target: Record<string, unknown> = object;
  for (const b of bricks) {
    if (b in target && isPlainObject(target[b])) {
      target = target[b];
    } else {
      return;
    }
  }

  if (lastKey && lastKey in target) {
    delete target[lastKey];
  }
}

export default deleteDeep;
