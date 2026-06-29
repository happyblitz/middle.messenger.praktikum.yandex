import type { Chat } from "../core/Store";
import { testUser } from "./user";

let id = 1234;

export const testChat = (options: Partial<Chat> = {}) => {
  const chat: Chat = {
    id: 100,
    title: `my chat #${id}`,
    last_message: {
      user: testUser(),
      time: "2026-01-01T18:45:32",
      content: "hi there",
    },
    ...options,
  };

  id++;

  return chat;
};
