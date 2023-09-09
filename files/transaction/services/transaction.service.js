const { default: mongoose } = require("mongoose")
const { v4: uuidv4 } = require("uuid")
const { StripePaymentService } = require("../../../providers/stripe/stripe")
const {
  TransactionFailure,
  TransactionSuccess,
  TransactionMessages,
} = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")

const { TransactionRepository } = require("../transaction.repository")
const { queryConstructor } = require("../../../utils")
const { OrderRepository } = require("../../order/order.repository")
const { OrderService } = require("../../order/order.service")

const uuid = uuidv4()

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async verifyStripePaymentService(payload) {
    const { transactionId, status, subscriptionPlanId } = payload

    const transaction = await TransactionRepository.fetchOne({
      transactionId: transactionId,
    })

    if (!transaction) return { success: false, msg: `transaction not found` }

    if (transaction.status === "paid" || transaction.status === "failed")
      return { success: false, msg: `transaction already updated` }

    if (status === "succeeded") {
      transaction.status = "paid"
      await transaction.save()

      //if payment is successful, subscription should be created
      const order = await OrderService.createOrder({
        userId: new mongoose.Types.ObjectId(transaction.userId),
        name: transaction.name,
        email: transaction.email,
        amount: transaction.amount,
        subscriptionPlanId,
        transactionId: transaction._id,
      })

      if (!order) return { success: false, msg: `unable to create order` }

      return {
        success: true,
        msg: `transaction status update successful`,
      }
    }

    if (status === "failed") {
      transaction.status = "failed"
      await transaction.save()

      return {
        success: true,
        msg: `transaction status update successful`,
      }
    }
  }

  static async initiateCheckoutSession(payload, host) {
    const { priceId, userId, channel, subscriptionId, quantity } = payload

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    if (!user) return { success: false, msg: `user not found` }

    await this.getConfig()
    const checkout = await this.paymentProvider.createCheckOutSession({
      priceId,
      quantity,
      userId,
      uuid,
    })

    if (!checkout)
      return { success: false, msg: `unable to successfully checkout` }

    const confirmTransaction = await TransactionRepository.fetchOne({
      priceId,
    })

    const { id, amount_total } = checkout

    if (confirmTransaction) {
      await TransactionRepository.updateTransactionDetails(
        { priceId },
        { sessionId: id }
      )

      return {
        success: true,
        msg: TransactionSuccess.INITIATE,
        data: checkout,
      }
    }

    await TransactionRepository.create({
      name: user.fullName,
      email: user.email,
      cost: amount_total,
      userId,
      priceId,
      channel,
      transactionUuid: uuid,
      sessionId: id,
      subscriptionId,
    })

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: checkout,
    }
  }

  static async retrieveCheckOutSession(payload) {
    await this.getConfig()
    const session = await this.paymentProvider.retrieveCheckOutSession(payload)

    if (!session)
      return { success: false, msg: `unable to unable to verify status` }

    return {
      success: true,
      msg: TransactionSuccess.UPDATE,
      paymentStatus: session,
    }
  }

  // static async getTransactionService(payload, locals) {
  //   const { error, params, limit, skip, sort } = queryConstructor(
  //     payload,
  //     "createdAt",
  //     "Transaction"
  //   )
  //   if (error) return { success: false, msg: error }

  //   let teacher = { userId: new mongoose.Types.ObjectId(locals._id) }

  //   const transaction = await TransactionRepository.fetchTransactionsByParams({
  //     ...params,
  //     limit,
  //     skip,
  //     sort,
  //     ...teacher,
  //   })

  //   if (transaction.length < 1)
  //     return { success: false, msg: `you don't have any transaction history` }

  //   return {
  //     success: true,
  //     msg: `transaction fetched successfully`,
  //     data: transaction,
  //   }
  // }
}

module.exports = { TransactionService }
