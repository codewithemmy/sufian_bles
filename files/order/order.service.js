const { default: mongoose } = require("mongoose")
const moment = require("moment")
const { OrderRepository } = require("./order.repository")
const { queryConstructor, AlphaNumeric } = require("../../utils")
const { OrderMessages } = require("./order.message")
const {
  TransactionRepository,
} = require("../transaction/transaction.repository")
const { TransactionMessages } = require("../transaction/transaction.messages")

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

    // let status

    // if (transaction.status === "paid") {
    //   status = "Active"
    // } else if (transaction.status === "failed") {
    //   status = "Cancelled"
    // }

    const randomGen = AlphaNumeric(7, "number")

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

  static async updateOrderService(id, payload) {
    const order = await OrderRepository.fetchOne({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!order._id) return { success: false, msg: OrderMessages.ORDER_ERROR }

    await OrderRepository.updateOrder(id, payload)

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
}

module.exports = { OrderService }
