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

  async createCheckOutSession(paymentPayload) {
    const { priceId, channel, subscriptionId, userId, quantity } =
      paymentPayload
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.DOMAIN_URL}?success=true`,
        cancel_url: `${process.env.DOMAIN_URL}?canceled=true`,
      })

     
      return { session }
    } catch (error) {
      // console.log("error", )
      return { error: error.message }
    }
  }

  async verifyCheckOutSession(paymentPayload) {
    // const { priceId } = paymentPayload
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Service",
              },
              unit_amount: 2701,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.DOMAIN_URL}?success=true`,
        cancel_url: `${process.env.DOMAIN_URL}?canceled=true`,
      })

      return { session }
    } catch (error) {
      console.log("error", error)
    }
  }
}

module.exports = { StripePaymentService }
