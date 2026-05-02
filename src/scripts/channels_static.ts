interface Ichannel {
  id: number;
  username: string;
  new_messages: number;
  last_message: string;
  timestamp: string;
  avatar?: string;
}

const channels: Ichannel[] = [
  {
    id: 1,
    username: "Петрушкин",
    new_messages: 0,
    last_message: "Привет, уже заценил новый дизайн сайта?",
    timestamp: "2026-05-20T10:15:00Z",
    avatar: "/static/avatars/1.svg",
  },
  {
    id: 2,
    username: "Маришка",
    new_messages: 100,
    last_message: "Это та, о ком я подумала?",
    timestamp: "2026-05-20T09:42:12Z",
    avatar: "/static/avatars/2.svg",
  },
  {
    id: 3,
    username: "Оптимист Слава",
    new_messages: 1,
    last_message: "Я обновил прод, все, кажется, на месте и работает!",
    timestamp: "2026-05-19T22:10:05Z",
    avatar: "/static/avatars/3.svg",
  },
  {
    id: 4,
    username: "Дядя Степа",
    new_messages: 0,
    last_message: "В наше время двери такие низкие, а проемы узкие",
    timestamp: "2026-05-19T18:30:45Z",
  },
  {
    id: 5,
    username: "чат бот 67",
    new_messages: 0,
    last_message: "Your ticket #4022 has been marked as resolved by our team.",
    timestamp: "2026-05-19T15:20:00Z",
  },
  {
    id: 6,
    username: "Начальница",
    new_messages: 1,
    last_message: "Не забудь отправить мне всю документацию к концу дня",
    timestamp: "2026-05-19T12:05:30Z",
    avatar: "/static/avatars/6.svg",
  },
  {
    id: 7,
    username: "Страшилкин",
    new_messages: 2,
    last_message: "Сервер точно упадет с такой нагрузкой..",
    timestamp: "2026-05-18T16:45:10Z",
    avatar: "/static/avatars/7.svg",
  },
  {
    id: 8,
    username: "Аня Маркетинг",
    new_messages: 0,
    last_message: "Я подготовила буклеты для резентации",
    timestamp: "2026-05-18T14:30:00Z",
  },
  {
    id: 9,
    username: "Слоеный пирог",
    new_messages: 0,
    last_message: "Новый рецепт пирогов только сегодня, скридка 25%",
    timestamp: "2026-05-18T11:20:15Z",
  },
  {
    id: 10,
    username: "Сестричка",
    new_messages: 0,
    last_message: "На выходных семейный сбор, будь готов",
    timestamp: "2026-05-17T09:00:00Z",
    avatar: "/static/avatars/10.svg",
  },
];

const updChannels = channels.map((el) => ({
  ...el,
  avatar: el.avatar ?? "/static/avatars/default.svg",
}));

export default updChannels;
