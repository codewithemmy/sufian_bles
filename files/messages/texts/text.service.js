const { default: mongoose } = require("mongoose")
const {
  ConversationRepository,
} = require("../conversations/conversation.repository")
const { TextRepository } = require("./text.repository")
const { TextMessages } = require("./text.messages")
const { SocketRepository } = require("../sockets/sockets.repository")
const { queryConstructor } = require("../../../utils")

class TextService {
  static async sendText(value, textPayload) {
    const { recipientId, recipient, message, orderId } = value.body
    const { image } = value

    const {
      _id,
      isAdmin,
      io,
      image: senderImage,
      firstName,
      lastName,
      email,
    } = textPayload

    let conversationId
    let conversation = await ConversationRepository.findSingleConversation({
      $or: [
        {
          entityOneId: new mongoose.Types.ObjectId(_id),
          entityTwoId: new mongoose.Types.ObjectId(recipientId),
          orderId,
        },
        {
          entityOneId: new mongoose.Types.ObjectId(recipientId),
          entityTwoId: new mongoose.Types.ObjectId(_id),
          orderId,
        },
      ],
    })

    if (!conversation) {
      const newConversation = await ConversationRepository.createConversation({
        entityOneId: new mongoose.Types.ObjectId(_id),
        entityOne: isAdmin ? "Admin" : "User",
        entityTwoId: new mongoose.Types.ObjectId(recipientId),
        entityTwo: recipient,
        orderId,
      })
      conversationId = newConversation._id
      conversation = newConversation
    } else conversationId = conversation._id

    if (!message && !image) {
      return { success: false, msg: TextMessages.CREATE_ERROR }
    }

    const text = await TextRepository.createText({
      senderId: new mongoose.Types.ObjectId(_id),
      sender: isAdmin ? "Admin" : "User",
      recipientId: new mongoose.Types.ObjectId(recipientId),
      recipient: recipient,
      conversationId,
      message,
      image,
    })

    if (!text._id) return { success: false, msg: TextMessages.CREATE_ERROR }

    // updating conversation updatedAt so the conversation becomes the most recent
    await ConversationRepository.updateConversation(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { updatedAt: new Date() }
    )

    const socketDetails = await SocketRepository.findSingleSocket({
      userId: new mongoose.Types.ObjectId(recipientId),
    })

    if (socketDetails)
      io.to(socketDetails.socketId).emit("private-message", {
        message,
        conversationId,
        image,
        sender: {
          image: senderImage,
          name: lastName ? lastName : firstName,
          email,
        },
      })

    return { success: true, msg: TextMessages.CREATE, data: { conversationId } }
  }

  static async fetchTexts(textPayload, user) {
    const { error, params, limit, skip, sort } = queryConstructor(
      textPayload,
      "createdAt",
      "Text"
    )
    if (error) return { success: false, msg: error }

    if (!params.conversationId)
      return { success: false, msg: TextMessages.MISSING_CONVERSATION_ID }

    const texts = await TextRepository.fetchTextsByParams({
      $or: [
        { senderId: new mongoose.Types.ObjectId(user._id) },
        { recipientId: new mongoose.Types.ObjectId(user._id) },
      ],
      conversationId: params.conversationId,
      limit,
      skip,
      sort,
    })

    if (texts.length === 0)
      return { success: false, msg: TextMessages.FETCH_NONE }

    return { success: true, msg: TextMessages.FETCH, data: texts }
  }
}

module.exports = { TextService }
