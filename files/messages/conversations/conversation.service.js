const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../../utils")
const { ConversationRepository } = require("./conversation.repository")
const { ConversationMessages } = require("./conversation.messages")
const { TextRepository } = require("../texts/text.repository")
const { TextMessages } = require("../texts/text.messages")

class ConversationService {
  static async createConversation(conversationPayload) {
    return ConversationRepository.createConversation(conversationPayload)
  }

  static async fetchConversations(conversationPayload, userId) {
    const { _id } = conversationPayload
    let chatId
    if (_id) {
      chatId = { conversationId: new mongoose.Types.ObjectId(_id) }
    }

    const conversations = await ConversationRepository.getConversationsByParams(
      {
        $or: [
          { entityOneId: new mongoose.Types.ObjectId(userId) },
          { entityTwoId: new mongoose.Types.ObjectId(userId) },
        ],
        ...conversationPayload,
      }
    )
    const chats = await TextRepository.getTextsByParams({
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId) },
        { recipientId: new mongoose.Types.ObjectId(userId) },
      ],
      ...chatId,
    })

    if (conversations.length === 0)
      return {
        success: true,
        msg: ConversationMessages.NO_CONVERSATIONS_FETCHED,
        data: [],
      }

    if (chats.length === 0)
      return { success: true, msg: TextMessages.FETCH_NONE, data: [] }

    const newResult = [...conversations, ...chats]

    return {
      success: true,
      msg: ConversationMessages.FETCH,
      data: newResult,
    }
  }

  // static async fetchConversations(conversationPayload, userId) {
  //   const { error, limit, skip, sort } = queryConstructor(
  //     conversationPayload,
  //     "updatedAt",
  //     "Conversation"
  //   )
  //   if (error) return { success: false, msg: error }

  //   const conversations =
  //     await ConversationRepository.fetchConversationsByParams({
  //       $or: [
  //         { entityOneId: new mongoose.Types.ObjectId(userId) },
  //         { entityTwoId: new mongoose.Types.ObjectId(userId) },
  //       ],
  //       limit,
  //       skip,
  //       sort,
  //     })

  //   if (conversations.length === 0)
  //     return {
  //       success: true,
  //       msg: ConversationMessages.NO_CONVERSATIONS_FETCHED,
  //       data: [],
  //     }

  //   return {
  //     success: true,
  //     msg: ConversationMessages.FETCH,
  //     data: conversations,
  //   }
  // }
}

module.exports = { ConversationService }
