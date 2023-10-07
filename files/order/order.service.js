const { default: mongoose } = require("mongoose")
const moment = require("moment")
const { OrderRepository } = require("./order.repository")
const { queryConstructor, AlphaNumeric } = require("../../utils")
const { OrderMessages } = require("./order.message")
const {
  TransactionRepository,
} = require("../transaction/transaction.repository")
const { TransactionMessages } = require("../transaction/transaction.messages")
const {
  ConversationRepository,
} = require("../messages/conversations/conversation.repository")

const { TextRepository } = require("../messages/texts/text.repository")

class OrderService {
  static async createOrder(payload) {
    const {
      userId,
      status,
      isConfirmed,
      orderName,
      selectedTire,
      dateOfDelivery,
      orderValue,
      transactionId,
      ...rest
    } = payload

    const transaction = await TransactionRepository.fetchOne({
      userId: userId,
    })

    if (!transaction)
      return { success: false, msg: TransactionMessages.TRANSACTION_NOT_FOUND }

    let randomGen
    let duplicateRandomGen

    // Keep generating a new randomGen until it doesn't collide with duplicateRandomGen
    do {
      randomGen = AlphaNumeric(7, "number")

      duplicateRandomGen = await OrderRepository.fetchOne({
        orderId: randomGen,
      })
    } while (duplicateRandomGen)

    const duplicateOrder = await OrderRepository.fetchOne({
      transaction: transaction._id,
    })

    if (duplicateOrder) return { success: false, msg: OrderMessages.DUPLICATE }

    const order = await OrderRepository.create({
      ...rest,
      orderId: `#${randomGen}`,
      orderName,
      userId,
      status,
      isConfirmed,
      selectedTire,
      orderValue,
      dateOfDelivery,
      transactionId,
    })

    if (!order._id) return { success: false, msg: OrderMessages.CREATE_ERROR }

    return { success: true, msg: OrderMessages.CREATE_SUCCESS }
  }

  static async fetchOrder(payload, locals) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Order"
    )

    if (error) return { success: false, msg: error }

    const { _id, isAdmin } = locals

    let extra = {}

    if (!isAdmin) {
      extra = { userId: new mongoose.Types.ObjectId(_id) }
    }

    const order = await OrderRepository.fetchFiles({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
    })

    if (order.length < 1)
      return { success: true, msg: OrderMessages.NONE_FOUND, data: [] }

    return {
      success: true,
      msg: OrderMessages.FETCH_SUCCESS,
      data: order,
    }
  }

  static async updateOrderService(id, payload, jwt) {
    const order = await OrderRepository.fetchOne({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!order._id) return { success: false, msg: OrderMessages.ORDER_ERROR }

    await OrderRepository.updateOrder(id, payload)

    if (payload.dateOfDelivery && payload.reasonForExtension) {
      let conversationId
      let conversation = await ConversationRepository.findSingleConversation({
        $or: [
          {
            entityOneId: new mongoose.Types.ObjectId(jwt),
            entityTwoId: new mongoose.Types.ObjectId(order.userId),
            orderId: order.orderId,
          },
          {
            entityOneId: new mongoose.Types.ObjectId(order.userId),
            entityTwoId: new mongoose.Types.ObjectId(jwt),
            orderId: order.orderId,
          },
          {
            entityOneId: new mongoose.Types.ObjectId(jwt),
            entityTwoId: new mongoose.Types.ObjectId(order.userId),
          },
          {
            entityOneId: new mongoose.Types.ObjectId(order.userId),
            entityTwoId: new mongoose.Types.ObjectId(jwt),
          },
        ],
      })

      if (!conversation)
        return {
          success: false,
          msg: OrderMessages.NO_ORDER_CONVERSATION,
        }

      conversationId = conversation._id

      const text = await TextRepository.createText({
        senderId: new mongoose.Types.ObjectId(jwt),
        sender: "Admin",
        recipientId: new mongoose.Types.ObjectId(order.userId),
        recipient: "User",
        conversationId,
        message: payload.reasonForExtension,
      })

      if (!text._id) return { success: false, msg: TextMessages.CREATE_ERROR }

      let lastMessage = new mongoose.Types.ObjectId(text._id)

      // updating conversation updatedAt so the conversation becomes the most recent
      await ConversationRepository.updateConversation(
        { _id: new mongoose.Types.ObjectId(conversationId) },
        { updatedAt: new Date(), lastMessage }
      )
    }

    return {
      success: true,
      msg: OrderMessages.UPDATE_SUCCESS,
    }
  }

  static async fetchEnterpriseOrder(user) {
    const { enterpriseId } = user
    const Order = await OrderRepository.fetchOne({
      enterpriseId: enterpriseId,
    })

    if (!Order._id) return { success: false, msg: OrderMessages.NONE_FOUND }

    return {
      success: true,
      msg: OrderMessages.FETCH_SUCCESS,
      data: Order,
    }
  }

  static async uploadOrderFileService(payload, id) {
    const { image } = payload

    const order = await OrderRepository.fetchOne({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!order._id) return { success: false, msg: OrderMessages.ORDER_ERROR }

    await OrderRepository.uploadOrderFile(id, {
      file: image,
    })

    return {
      success: true,
      msg: OrderMessages.UPDATE_SUCCESS,
    }
  }

  static async fetchOrderFile(payload, locals) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Order"
    )

    if (error) return { success: false, msg: error }

    const { _id, isAdmin } = locals

    let extra = {}

    if (!isAdmin) {
      extra = { userId: new mongoose.Types.ObjectId(_id) }
    }

    const order = await OrderRepository.fetch({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
    })

    if (order.length < 1)
      return { success: true, msg: OrderMessages.NONE_FOUND, data: [] }

    return {
      success: true,
      msg: OrderMessages.FETCH_SUCCESS,
      data: order,
    }
  }
}

module.exports = { OrderService }
