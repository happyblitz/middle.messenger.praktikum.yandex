import updChannels from "./static-data/channels_static";
import messages from "./static-data/messages_static";
import type { Channel } from "./static-data/channels_static";
import type { Message } from "./static-data/messages_static";
import { toBase64 } from "../utils/Globals";

class ChannelAPI {
  public static async getChannels(): Promise<Channel[]> {
    return updChannels;
  }

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
    return {
      channelId,
      message: {
        message: (formdata.get("message") as string).trim(),
        username: "User",
        ...(file && { image: file }),
        avatar: "/static/avatars/user.svg",
      },
    };
  }
}

export default ChannelAPI;
