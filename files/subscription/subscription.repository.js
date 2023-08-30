const { default: mongoose } = require("mongoose")
const { Subscription } = require("./subscription.model")
const { LIMIT, SKIP, SORT } = require("../../constants")

class SubscriptionRepository {
  static async create(subscriptionPayload) {
    return Subscription.create({ ...subscriptionPayload })
  }

  static async fetch(payload) {
    return Subscription.find({ ...payload })
  }

  static async fetchAll(payload, select) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = payload

    return await Subscription.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
  }
}

module.exports = { SubscriptionRepository }
