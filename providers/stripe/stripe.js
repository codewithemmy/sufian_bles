const mongoose = require("mongoose")
const { config } = require("../../core/config")
const {
  TransactionRepository,
} = require("../../files/transaction/transaction.repository")
const { UserRepository } = require("../../files/user/user.repository")
const stripe = require("stripe")(config.STRIPE_SECRET_KEY)

class StripePaymentService {
  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async createPaymentIntent(paymentPayload) {
    const { amount, channel, subscriptionId, userId } = paymentPayload
    try {
      const user = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(userId),
      })
      if (!user) return { success: false, msg: `user not found` }

      if (!amount)
        return {
          success: false,
          msg: `payment and currency cannot be null`,
        }
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
      })

      if (!paymentIntent)
        return {
          success: false,
          msg: `error creating payment intent, try again later`,
        }

      const { client_secret, id } = paymentIntent

      await TransactionRepository.create({
        name: user.fullName,
        email: user.email,
        amount,
        userId,
        channel,
        clientSecret: client_secret,
        transactionId: id,
        subscriptionId,
      })

      return {
        paymentIntentData: paymentIntent,
      }
    } catch (error) {
      console.log("error", error)
    }
  }
}

module.exports = { StripePaymentService }
