const { default: mongoose } = require("mongoose")
const { SubscriptionRepository } = require("./subscription.repository")
const { queryConstructor } = require("../../utils")
const { SubscriptionMessages } = require("./subscription.message")
const {
  TransactionRepository,
} = require("../transaction/transaction.repository")

class SubscriptionService {
  static async fetchSubscription(user) {
    const subscription = await SubscriptionRepository.fetch({
      userId: new mongoose.Types.ObjectId(user._id),
    })

    if (!subscription)
      return { success: false, msg: SubscriptionMessages.NONE_FOUND }

    return {
      success: true,
      msg: SubscriptionMessages.FETCH_SUCCESS,
      data: subscription,
    }
  }
}

module.exports = { SubscriptionService }
