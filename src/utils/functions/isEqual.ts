import isPlainObject from "./isPlainObject";

/**
 * Сравнивает аргументы. Не умееет сравнивать сложные объекты.
 * @param lhs Аргумент для сравнения
 * @param rhs Аргумент для сравнения
 * @returns boolean. Аргументы равны или нет.
 */
function isEqual(lhs: unknown, rhs: unknown): boolean {
  // сравнение примитивов, ссылок
  if (lhs === rhs) {
    return true;
  }

  // один из аргументов null
  if (lhs === null || rhs === null) {
    return lhs === rhs;
  }

  // проверка массивов
  if (Array.isArray(lhs) && Array.isArray(rhs)) {
    if (lhs.length !== rhs.length) {
      return false;
    }

    return lhs.every((value, index) => isEqual(value, rhs[index]));
  }

  // один из аргументов все же массив
  if (Array.isArray(lhs) || Array.isArray(rhs)) {
    return false;
  }

  // сравниваем обычные объекты
  if (isPlainObject(lhs) && isPlainObject(rhs)) {
    const lhsKeys = Object.keys(lhs);
    const rhsKeys = Object.keys(rhs);
    if (lhsKeys.length !== rhsKeys.length) {
      return false;
    }

    for (const k of lhsKeys) {
      if (!isEqual(lhs[k], rhs[k])) {
        return false;
      }
    }

    return true;
  }

  // один из аргументов все же простой объект
  if (isPlainObject(lhs) || isPlainObject(rhs)) {
    return false;
  }

  // остальные объекты (не равны по ссылке)
  // если потребуется сравнение map, set и т.д., добавить отдельно выше
  return false;
}

export default isEqual;
