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
    const { userId, subscriptionPlanId, orderValue, ...rest } = payload

    const transaction = await TransactionRepository.fetchOne({
      userId: userId,
    })

    if (!transaction)
      return { success: false, msg: TransactionMessages.TRANSACTION_NOT_FOUND }

    let status

    if (transaction.status === "paid") {
      status = "Active"
    } else if (transaction.status === "failed") {
      status = "Cancelled"
    }

    const randomGen = AlphaNumeric(7, "number")

    const duplicateOrder = await OrderRepository.fetchOne({
      transaction: transaction._id,
    })

    if (duplicateOrder) return { success: false, msg: OrderMessages.DUPLICATE }

    const order = await OrderRepository.create({
      ...rest,
      orderId: `#${randomGen}`,
      orderName: subscriptionPlanId,
      orderValue,
      status,
      transaction: transaction._id,
    })

    if (!order._id) return { success: false, msg: OrderMessages.CREATE_ERROR }

    return { success: true, msg: OrderMessages.CREATE_SUCCESS }
  }

  static async fetchOrder(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Order"
    )

    if (error) return { success: false, msg: error }

    const order = await OrderRepository.fetch({
      ...params,
      limit,
      skip,
      sort,
    })

    if (order.length < 1)
      return { success: false, msg: OrderMessages.NONE_FOUND }

    return {
      success: true,
      msg: OrderMessages.FETCH_SUCCESS,
      data: order,
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

  static async updateSupscripton(user, payload) {
    const { body } = payload
    // chwck if the user already made payment for the subscripton plan
    const transaction = await TransactionRepository.fetchOne({
      paymentFor: "enterpriseOrder",
      enterpriseId: user.enterpriseId,
      _id: body.transactionId,
      status: "confirmed",
    })
    // throw eror if no ranssaction was found for the lan the user is subscribing for
    if (!transaction)
      return { success: false, msg: TransactionMessages.TRANSACTION_NOT_FOUND }
    // check if the usser account already have a Order, (Order is not expired)
    const plan = await OrderRepository.fetchOne({
      enterpriseId: new mongoose.Types.ObjectId(user.enterpriseId),
    })

    if (plan.transactionId.toString() === body.transactionId) {
      return { success: false, msg: TransactionMessages.DUPLICATE_TRANSACTION }
    }
    // if sbscription does not exist, create one for the enterprize
    if (!plan) {
      return this.upgradeOrder({ user, body })
    }

    const currentMonthDays = moment().daysInMonth()
    let expiresAt
    if (plan.OrderPlanId.toString() === body.OrderPlanId) {
      // plan is the same then add new month Order to current Order
      expiresAt = plan.expiresAt + currentMonthDays
    } else {
      expiresAt = currentMonthDays
    }

    await OrderRepository.update(user.enterpriseId, {
      $set: { expiresAt, ...body },
    })

    return {
      success: true,
      msg: OrderMessages.UPGRADE_SUCCESSFUL,
    }
  }
}

module.exports = { OrderService }
