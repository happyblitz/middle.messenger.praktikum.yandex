import messages from "./static-data/messages_static";
import type { Message } from "./static-data/messages_static";
import { toBase64 } from "../utils/Globals";
import { getDisplayName, getUserAvatar } from "../utils/Globals";
import store, { type User } from "../core/Store";

/**
 * Заглушка на время. Аля отправляем сообщение
 */
class ChannelAPI {
  public static async getMessages(chatId: number): Promise<Message[]> {
    if (chatId === 1) {
      return messages;
    }

    return [];
  }

  public static async newMessage(
    channelId: number,
    formdata: FormData,
  ): Promise<{ channelId: number; message: Message }> {
    const file = await toBase64(formdata.get("attach") as File);
    const user = store.getState().user as User;
    return {
      channelId,
      message: {
        message: (formdata.get("message") as string).trim(),
        username: getDisplayName(user),
        ...(file && { image: file }),
        avatar: getUserAvatar(user),
      },
    };
  }
}

export default ChannelAPI;
