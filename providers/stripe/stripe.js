const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")
const { config } = require("../../core/config")
const {
  TransactionRepository,
} = require("../../files/transaction/transaction.repository")
const { UserRepository } = require("../../files/user/user.repository")
const stripe = require("stripe")(config.STRIPE_SECRET_KEY)

const uuid = uuidv4()

class StripePaymentService {
  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  // async createCheckOutSession(paymentPayload) {
  //   const { priceId, email, quantity } = paymentPayload
  //   try {
  //     const session = await stripe.checkout.sessions.create({
  //       payment_method_types: ["card"],
  //       line_items: [
  //         {
  //           price: priceId,
  //           quantity: quantity,
  //         },
  //       ],
  //       customer: email,
  //       mode: "payment",
  //       success_url: `${STRIPE_SUCCESS_CALLBACK}?userId=${user._id}&uuid=${uuid}`,
  //       cancel_url: `${STRIPE_CANCEL_CALLBACK}?userId=${user._id}&uuid=${uuid}`,
  //     })

  //     return session
  //   } catch (error) {
  //     // console.log("error", )
  //     return { error: error.message }
  //   }
  // }

  async createCheckOutSession(paymentPayload) {
    const { priceId, email, quantity, userId, host } = paymentPayload

    console.log("host", host)

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    if (!user) return { success: false, msg: `user not found` }

    try {
      if (!user.stripeCustomerId) {
        //- create stripe customer and save if not created to stripe side yet
        let stripeCustomer = await stripe.customers.create({
          email: user.email,
        })

        user.stripeCustomerId = stripeCustomer.id
        await user.save()
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        customer: user.stripeCustomerId,
        mode: `payment`,
        success_url: `http://${host}/payment-success?userId=${user._id}&uuid=${uuid}`,
        cancel_url: `http://${host}/user/service?userId=${user._id}&uuid=${uuid}`,
      })

      return session
    } catch (error) {
      // console.log("error", )
      return { success: false, msg: error.message }
    }
  }
}

module.exports = { StripePaymentService }
