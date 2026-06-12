/**
 * Создает задержку перед выполнением функции
 * Если в это время функция снова будет запущена, таймер задержки сбросится
 * @param func
 * @param delay
 * @returns
 */
function debounce(func: (e: Event) => void, delay: number) {
  let timerId: number | null;

  return function (e: Event) {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => func(e), delay);
  };
}

export default debounce;
