const { default: mongoose, mongo } = require("mongoose")
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
      .populate({ path: "userId", select: "username fullName email" })
      .populate({ path: "orderName", select: "title" })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
  }

  static async updateOrder(id, params) {
    return Order.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { ...params },
      { new: true, runValidator: true }
    )
  }
}

module.exports = { OrderRepository }
