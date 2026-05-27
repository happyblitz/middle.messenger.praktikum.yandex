type FieldData = {
  label: string;
  value: string;
};

export type User = {
  email: FieldData;
  login: FieldData;
  first_name: FieldData;
  second_name: FieldData;
  display_name: FieldData;
  phone: FieldData;
  avatar: FieldData;
};

const user: User = {
  email: {
    label: "Почта",
    value: "pochta@yandex.ru",
  },
  login: {
    label: "Логин",
    value: "user",
  },
  first_name: {
    label: "Имя",
    value: "Иван",
  },
  second_name: {
    label: "Фамилия",
    value: "Иванов",
  },
  display_name: {
    label: "Имя в чатах",
    value: "user",
  },
  phone: {
    label: "Телефон",
    value: "+7(111) 111-11-11",
  },
  avatar: {
    label: "Аватар",
    value: "/static/avatars/user.svg",
  },
};

export default user;
