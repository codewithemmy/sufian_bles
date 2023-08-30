const mongoose = require("mongoose")
const { config } = require("../../core/config")
const stripe = require("stripe")(config.STRIPE_SECRET_KEY)

class StripePaymentService {
  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async createPaymentIntent(paymentPayload) {
    const { amount } = paymentPayload
    try {
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

      return {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount,
      }
    } catch (error) {
      console.log("error", error)
    }
  }
}

module.exports = { StripePaymentService }
