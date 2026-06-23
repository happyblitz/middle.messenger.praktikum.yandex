import type { Message } from "../core/Store";

let id = 1;

export const testMessage = (options: Partial<Message> = {}) => {
  const message: Message = {
    content: "Aenean sed odio sit amet sapien tincidunt commodo.",
    type: "message",
    time: "2026-01-01T18:34:56",
    user_id: 100,
    id,
    chat_id: 200,
    ...options,
  };

  id++;

  return message;
};
