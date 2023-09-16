const { default: mongoose } = require("mongoose")
const { queryConstructor } = require("../../../utils")
const { ConversationRepository } = require("./conversation.repository")
const { ConversationMessages } = require("./conversation.messages")
const { TextRepository } = require("../texts/text.repository")

class ConversationService {
  static async createConversation(conversationPayload) {
    return ConversationRepository.createConversation(conversationPayload)
  }

  static async fetchConversations(conversationPayload, userId) {
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
    })

    if (conversations.length === 0)
      return {
        success: true,
        msg: ConversationMessages.NO_CONVERSATIONS_FETCHED,
        data: [],
      }

    if (chats.length === 0)
      return { success: true, msg: TextMessages.FETCH_NONE, data: [] }

    return {
      success: true,
      msg: ConversationMessages.FETCH,
      data: { conversations, chats },
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
