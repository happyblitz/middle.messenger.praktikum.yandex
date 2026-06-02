import Api from "./API";

class ChatsApi extends Api {
  constructor() {
    super("/chats");
  }

  chats() {
    return this.get();
  }
}

const chatsApi = new ChatsApi();

export default chatsApi;
