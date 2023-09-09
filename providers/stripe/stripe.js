const mongoose = require("mongoose")
const { config } = require("../../core/config")
const {
  TransactionRepository,
} = require("../../files/transaction/transaction.repository")
const { UserRepository } = require("../../files/user/user.repository")
const { OrderService } = require("../../files/order/order.service")
const { OrderRepository } = require("../../files/order/order.repository")
const stripe = require("stripe")(config.STRIPE_SECRET_KEY)

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
    const { priceId, quantity, userId, uuid } = paymentPayload

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
        success_url: `${process.env.STRIPE_SUCCESS_CALLBACK}/payment-success?userId=${user._id}&uuid=${uuid}`,
        cancel_url: `${process.env.STRIPE_CANCEL_CALLBACK}/user/service?userId=${user._id}&uuid=${uuid}`,
      })

      return session
    } catch (error) {
      return { success: false, msg: error.message }
    }
  }
  async retrieveCheckOutSession(payload) {
    const { uuid, userId } = payload
    try {
      const user = await UserRepository.findSingleUserWithParams({
        _id: new mongoose.Types.ObjectId(userId),
      })

      if (!user) return { success: false, msg: `user not found` }

      const transaction = await TransactionRepository.fetchOne({
        userId: new mongoose.Types.ObjectId(userId),
        transactionUuid: uuid,
      })

      if (!transaction) return { success: false, msg: `transaction not found` }

      const session = await stripe.checkout.sessions.retrieve(
        `${transaction.sessionId}`
      )

      transaction.status = session.status
      await transaction.save()

      //if payment is successful, subscription should be created

      const confirmOrder = await OrderRepository.fetchOne({
        orderName: transaction.subscriptionId,
        userId: new mongoose.Types.ObjectId(userId),
        orderValue: transaction.cost,
      })

      if (confirmOrder) {
        confirmOrder.transactionId = transaction._id
        await confirmOrder.save()
        return session
      }

      await OrderService.createOrder({
        userId: new mongoose.Types.ObjectId(userId),
        orderName: transaction.subscriptionId,
        orderValue: transaction.cost,
        transactionId: transaction._id,
      })

      return session
    } catch (error) {
      console.log("error", error.message)
    }
  }
}

module.exports = { StripePaymentService }
