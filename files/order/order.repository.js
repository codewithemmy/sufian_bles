const { default: mongoose } = require("mongoose")
const { Order } = require("./order.model")
const { LIMIT, SKIP, SORT } = require("../../constants")

class OrderRepository {
  static async create(orderPayload) {
    return Order.create({ ...orderPayload })
  }

  static async fetchOne(payload) {
    return Order.findOne({ ...payload })
  }

  static async fetch(payload, select) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = payload

    return await Order.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
  }

  // static async update(id, params) {
  //   return Order.findOneAndUpdate(
  //     { enterpriseId: new mongoose.Types.ObjectId(id) },
  //     { ...params }
  //   )
  // }
}

module.exports = { OrderRepository }
