const { Conversation } = require("./conversation.model")

class ConversationRepository {
  static createConversation(conversationPayload) {
    return Conversation.create(conversationPayload)
  }

  static async findSingleConversation(conversationPayload) {
    return Conversation.findOne({ ...conversationPayload })
  }

  static async fetchConversationsByParams(conversationPayload) {
    const { limit, skip, sort, ...restOfPayload } = conversationPayload
    const conversations = await Conversation.find({
      ...restOfPayload,
    })
      .populate("entityOneId", {
        username: 1,
        profileImage: 1,
        fullName: 1,
        accountType: 1,
        email: 1,
        profileImage: 1,
        role: 1,
        image: 1,
      })
      .populate("entityTwoId", {
        username: 1,
        profileImage: 1,
        fullName: 1,
        accountType: 1,
        email: 1,
        profileImage: 1,
        role: 1,
        image: 1,
      })
      .populate("lastMessage")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return conversations
  }

  static async updateConversation(conversationPayload, update) {
    return Conversation.findOneAndUpdate({ ...conversationPayload }, update)
  }
}

module.exports = { ConversationRepository }
