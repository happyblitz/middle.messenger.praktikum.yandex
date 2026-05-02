import hbsAdapter from "./HbsAdapter.ts";
import uploadChannels from "./channels_static.ts";
import messagesChannel_1 from "./channel_1_static.ts";
import {
  fields as profileFields,
  avatar as profileAvatar,
} from "./profile_fields_static.ts";
import "../styles/main.scss";

const app = document.querySelector("[data-js-main]");

if (!app) {
  throw new Error("attrubute [data-js-main] not found");
}

interface Imessage {
  message: string;
  username: string;
  image?: string;
}

// причещаем некоторые данные с формы
const prettyData = (value: any): string => {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  return "";
};

// конвертируем картинку в формат base64
const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Если файла нет, сразу возвращаем пустую строку
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const cssHideClassName = "visually-hidden";
const cssModalClosedClass = "modal-closed";
const fixedModalClass = "fixed-box";

// закрываем все модальные окна
const closeModals = () => {
  const modals = app.querySelectorAll<HTMLElement>("[data-js-modal]");
  modals.forEach((modal) => {
    modal.style.display = "none";
  });
};

// вешаем обработчк на кнопку открытия малого модального окна
const newEventOpenModal = (
  bntSelector: string,
  modalSelector: string,
): void => {
  const btnElement = app.querySelector<HTMLButtonElement>(bntSelector);
  const modalElement = app.querySelector<HTMLElement>(modalSelector);

  if (btnElement && modalElement) {
    btnElement.addEventListener("click", () => {
      closeModals();
      modalElement.style.display = "block";
    });
  }
};

// вешаем обработчк на кнопку открытия большого модального окна
const newEventOpenSettingsModal = (
  bntSelector: string,
  modalSelector: string,
): void => {
  const btnElement = app.querySelector<HTMLButtonElement>(bntSelector);
  const modalElement = app.querySelector<HTMLElement>(modalSelector);

  if (btnElement && modalElement) {
    btnElement.addEventListener("click", () => {
      modalElement.classList.remove(cssModalClosedClass);
    });
  }
};

/**
 * ключи - страницы сайта
 * значения - функция с логикой отображения страницы
 */
const routes: Record<string, () => void> = {
  "/": () => {
    app.innerHTML = hbsAdapter.compile("pages");
  },
  "/403": () => {
    app.innerHTML = hbsAdapter.compile("system_error", {
      code: 403,
      code_message: "Доступ запрещен",
    });
  },
  "/404": () => {
    app.innerHTML = hbsAdapter.compile("system_error", {
      code: 404,
      code_message: "Страница не найдена",
    });
  },
  "/500": () => {
    app.innerHTML = hbsAdapter.compile("system_error", {
      code: 500,
      code_message: "Внутрення ошибка сервера",
    });
  },
  "/login": () => {
    // готовим данные для шаблона
    const params = new URLSearchParams(window.location.search);

    const login = prettyData(params.get("login"));
    const password = prettyData(params.get("password"));

    const showError = window.location.search && (!login || !password);
    const templateData = {
      login: login,
      password: password,
      error_message: showError ? "Пользователь не найден" : "",
      button_disabled: login && password ? "" : "disabled",
    };

    // компилируем шаблон
    app.innerHTML = hbsAdapter.compile("sign_in", templateData);

    // js для страницы
    const loginField = app.querySelector<HTMLInputElement>("[data-js-login]");
    const passwordField = app.querySelector(
      "[data-js-password]",
    ) as HTMLInputElement;
    const submitButton = app.querySelector(
      "[data-js-submit-button]",
    ) as HTMLButtonElement;

    if (loginField && passwordField && submitButton) {
      app.addEventListener("input", (event) => {
        if (event.target === loginField || event.target === passwordField) {
          submitButton.disabled = !Boolean(
            loginField.value.trim() && passwordField.value.trim(),
          );
        }
      });
    }
  },
  "/register": () => {
    // готовим данные для шаблона
    const params = new URLSearchParams(window.location.search);

    interface IreqFieldsValuesData {
      value: string;
      errorMessage?: string;
      dataJsAttribute?: string;
    }

    const reqFieldsValues: Record<string, IreqFieldsValuesData> = {
      email: {
        value: prettyData(params.get("email")),
        errorMessage: "Укажите ваш email",
      },
      login: {
        value: prettyData(params.get("login")),
        errorMessage: "Выберите логин",
      },
      name: {
        value: params.get("name")?.trim() ?? "",
        errorMessage: "Укажите ваш имя",
      },
      surname: {
        value: params.get("surname")?.trim() ?? "",
        errorMessage: "Укажите вашу фамилию",
      },
      phone: {
        value: params.get("phone")?.trim() ?? "",
        errorMessage: "Укажите ваш номер телефона",
      },
      password: {
        value: prettyData(params.get("password")),
        errorMessage: "Установите пароль",
      },
      passwordConfirm: {
        value: prettyData(params.get("password-confirm")),
        errorMessage: "Введите установленный пароль еще раз",
        dataJsAttribute: "data-js-password-confirm",
      },
    };

    const templateData: Map<string, any> = new Map();

    Object.entries(reqFieldsValues).forEach(([key, data]) => {
      templateData.set(key, data.value);

      const fieldError =
        window.location.search.length && !data.value && "errorMessage" in data;
      if (fieldError) {
        const errorKey =
          "register" + key.slice(0, 1).toUpperCase() + key.slice(1) + "Error";
        templateData.set(errorKey, data.errorMessage);
      }
    });

    const reqFieldsValuesExists = Object.values(reqFieldsValues).every(
      (v) => v.value,
    );
    const btnDisabledText = reqFieldsValuesExists ? "" : "disabled";
    templateData.set("button_disabled", btnDisabledText);

    // компилируем шаблон
    app.innerHTML = hbsAdapter.compile(
      "sign_up",
      Object.fromEntries(templateData),
    );

    // js для страницы

    /**
     * создаем словарь вида
     * const reqFields = {
     *   email: DOMfield as HTMLInputElement,
     *   ...
     * для всех ключей из reqFieldsValues
     * Если в словаре reqFieldsValues по ключу есть локальное поле dataJsAttribute,
     * используем его значение для поиска input поля
     */
    const reqFields = Object.fromEntries(
      Object.keys(reqFieldsValues).map((key) => {
        const dataJsAttribute =
          "dataJsAttribute" in reqFieldsValues[key]
            ? reqFieldsValues[key]["dataJsAttribute"]
            : `data-js-${key}`;
        const querySelector = app.querySelector(
          `[${dataJsAttribute}]`,
        ) as HTMLInputElement;
        return [key, querySelector];
      }),
    );

    const submitButton = app.querySelector<HTMLButtonElement>(
      "[data-js-submit-button]",
    );

    const reqFieldsExists = Object.values(reqFields).every((v) => v);
    if (reqFieldsExists && submitButton) {
      app.addEventListener("input", () => {
        submitButton.disabled = !Object.values(reqFields).every((v) =>
          v.value.trim(),
        );
      });
    }
  },
  "/messenger": () => {
    const params = new URLSearchParams(window.location.search);
    const activeChannelId = Number(params.get("id")) ?? 0;

    let messages: Imessage[] = [];

    // fake data for channel with id = 1
    if (activeChannelId === 1) {
      messages = messagesChannel_1;
    }

    const channels = uploadChannels.map((channel) => {
      const date = new Date(channel.timestamp);
      const messageDate = new Intl.DateTimeFormat("ru-RU").format(date);
      return {
        ...channel,
        last_message: channel.last_message.slice(0, 80),
        link: window.location.pathname + "?id=" + channel.id,
        date: messageDate,
        isActive: channel.id === activeChannelId,
      };
    });

    let activeChannel = null;
    for (const channel of channels) {
      if (channel.id == activeChannelId) {
        activeChannel = channel;
        break;
      }
    }

    app.innerHTML = hbsAdapter.compile("messenger", {
      channels,
      activeChannel,
      messages,
      profileFields,
      profileAvatar,
    });

    // обработчки кнопки: открывает список чатов в мобильной версии
    // закрывает модальные окна
    const backButtonElement = app.querySelector<HTMLButtonElement>(
      "[channel-is-not-active]",
    );

    const messengerElement = app.querySelector<HTMLInputElement>(
      "[data-js-messenger]",
    );

    if (backButtonElement && messengerElement) {
      backButtonElement.addEventListener("click", () => {
        closeModals();
        messengerElement.classList.remove("channel-is-active");
      });
    }

    // обработчик окна "Добавить в чат"
    newEventOpenModal("[data-js-adduser-show-modal]", "[data-js-adduser]");

    // обработчик окна "Удалить из чата"
    newEventOpenModal(
      "[data-js-removeuser-show-modal]",
      "[data-js-removeuser]",
    );

    // обработчик нажатия на кнопку закрытия модального окна
    app.addEventListener("click", (event) => {
      if (event.target instanceof Element) {
        if (event.target.closest("[data-js-modal-close]")) {
          closeModals();
        }
      }
    });

    // обработчик открытия страницы настроек профиля
    newEventOpenSettingsModal(
      "[data-js-messenger-burger-button]",
      "[data-js-profile]",
    );

    // обработчик открытия страницы редактирования профиля
    newEventOpenSettingsModal(
      "[data-js-profile-edit]",
      "[data-js-profile-edit-modal]",
    );

    // открытие страницы редактирования пароля профиля
    newEventOpenSettingsModal(
      "[data-js-profile-password]",
      "[data-js-profile-password-modal]",
    );

    // обработчик закрытия модального окна с классом @fixedModalClass
    app.addEventListener("click", (event) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-js-modal-close-self]")
      ) {
        const modal = target.closest("." + fixedModalClass);
        if (modal) {
          modal.classList.add(cssModalClosedClass);
        }
      }
    });

    // обработчик смены аватарки
    const formEditLogoAttach = app.querySelector<HTMLInputElement>(
      "[js-data-edit-logo-form-attach]",
    );

    const currentLogo =
      app.querySelectorAll<HTMLImageElement>("[js-data-logo]");

    if (formEditLogoAttach && currentLogo) {
      formEditLogoAttach.addEventListener("change", async () => {
        if (formEditLogoAttach?.files) {
          const attach = formEditLogoAttach.files[0];
          const newLogo64 = await toBase64(attach);
          currentLogo.forEach((element) => {
            if (element instanceof HTMLImageElement) {
              element.src = newLogo64;
            }
          });
        }
      });
    }

    // обработчики поля ввода в окне чата
    const channelWindowElement = app.querySelector<HTMLElement>(
      "[data-js-channel-messages]",
    );
    const inputElement = app.querySelector<HTMLTextAreaElement>(
      "[data-js-channel-input]",
    );
    const sendButtonElement = app.querySelector<HTMLButtonElement>(
      "[data-js-channel-input-send]",
    );

    const formAttach = app.querySelector<HTMLInputElement>(
      "[js-data-channel-form-attach]",
    );
    const attachedElement = app.querySelector<HTMLElement>(
      "[js-data-channel-attached]",
    );
    const formAttachFilename = app.querySelector<HTMLElement>(
      "[js-data-channel-attached-filename]",
    );
    const formAttachCancel = app.querySelector<HTMLButtonElement>(
      "[js-data-channel-attached-cancel]",
    );

    const allElementsExists =
      channelWindowElement &&
      inputElement &&
      sendButtonElement &&
      formAttach &&
      attachedElement &&
      formAttachFilename &&
      formAttachCancel;

    if (allElementsExists) {
      // обработчик добавления/удаления файла
      formAttach.addEventListener("change", () => {
        if (formAttach.files) {
          // отобразим название файла в форме
          // отобразим кнопку удаления файла
          // отобразим кнопку отправки сообщения
          formAttachFilename.textContent = formAttach.files[0].name;
          attachedElement.classList.remove(cssHideClassName);
          sendButtonElement.classList.remove(cssHideClassName);
        } else {
          // скрываем блок с названием файла и кнопкой удаления
          // скрываем кнопку отправки сообщения при пустом поле ввода
          attachedElement.classList.add(cssHideClassName);

          const inputValue = inputElement.value.trim();
          if (!inputValue) {
            sendButtonElement.classList.add(cssHideClassName);
          }
        }
      });

      // обработчик кнопки удаления файла
      formAttachCancel.addEventListener("click", () => {
        formAttach.value = "";
        formAttachFilename.textContent = "";
        attachedElement.classList.add(cssHideClassName);
      });

      inputElement.addEventListener("input", () => {
        const inputValue = inputElement.value.trim();
        if (inputValue) {
          sendButtonElement.classList.remove(cssHideClassName);
        } else {
          sendButtonElement.classList.add(cssHideClassName);
        }
      });

      // обработчик отправки сообщения
      sendButtonElement.addEventListener("click", async () => {
        const inputValue = inputElement.value.trim();

        // проверка наличия аттача
        let attachBasa64;
        if (formAttach?.files) {
          const attach = formAttach.files[0];
          attachBasa64 = await toBase64(attach);
        }

        if (inputValue || attachBasa64) {
          const newMessage = [
            {
              message: inputValue,
              username: "user",
              image: attachBasa64,
              avatar: profileAvatar,
            },
          ];

          channelWindowElement.insertAdjacentHTML(
            "beforeend",
            hbsAdapter.compile("new_message", { messages: newMessage }),
          );

          formAttach.value = "";
          inputElement.value = "";
          sendButtonElement.classList.add(cssHideClassName);

          if (attachedElement) {
            attachedElement.classList.add(cssHideClassName);
          }

          // Прокрутка до вставленного элемента
          const lastMessage = channelWindowElement.lastElementChild;
          if (lastMessage) {
            // Если внутри сообщения есть картинка
            const img = lastMessage.querySelector("img");
            if (img) {
              img.onload = () =>
                lastMessage.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
            } else {
              lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
            }
          }
        }
      });
    }
  },
};

const render = () => {
  const path = window.location.pathname;
  const activeRoute = routes[path] || routes["/404"];
  activeRoute();
};

render();
