const { default: mongoose } = require("mongoose")
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

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiatePaymentIntentTransaction(payload) {
    const { amount, userId, channel, subscriptionId } = payload

    await this.getConfig()
    const paymentDetails = await this.paymentProvider.createPaymentIntent({
      amount,
      channel,
      subscriptionId,
      userId,
    })

    if (!paymentDetails)
      return { success: false, msg: `unable to make or create payment intent` }

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: paymentDetails,
    }
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

  static async initiateCheckoutSession(payload) {
    const { priceId, cost, userId, channel, subscriptionId, quantity } =
      payload

    await this.getConfig()
    const checkout = await this.paymentProvider.createCheckOutSession({
      priceId,
      cost,
      userId,
      channel,
      subscriptionId,
      quantity,
    })

    if (!checkout)
      return { success: false, msg: `unable to successfully checkout` }

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: checkout,
    }
  }

  // static async verifyCheckoutSession(payload) {
  //   const { priceId } = payload

  //   await this.getConfig()
  //   const checkout = await this.paymentProvider.verifyCheckOutSession({
  //     priceId,
  //   })

  //   if (!checkout)
  //     return { success: false, msg: `unable to successfully checkout` }

  //   return {
  //     success: true,
  //     msg: TransactionSuccess.INITIATE,
  //     data: checkout,
  //   }
  // }

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
