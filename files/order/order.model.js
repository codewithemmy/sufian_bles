const mongoose = require("mongoose")
// const cron = require("node-cron")

const orderSchema = new mongoose.Schema(
  {
    orderValue: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderName: {
      type: mongoose.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    transactionId: {
      type: mongoose.Types.ObjectId,
      ref: "Transaction",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    dateOfDelivery: { type: Date, default: null },
    selectedTire: { type: String },
    status: {
      type: String,
      enum: ["completed", "active", "delivered", "canceled ", "in-progress"],
      default: "in-progress",
    },
    expiresAt: {
      type: Number,
    },
  },
  { timestamps: true }
)


const order = mongoose.model("Order", orderSchema, "order")

module.exports = { Order: order }


// cron.schedule("0 0 * * *", async () => {
//   const subscriptions = await subscription.find({ expiresAt: { $gt: 0 } })

//   for (const sub of subscriptions) {
//     const newExpiresAt = sub.expiresAt - 1 // Deduct 1 day from expiresAt
//     await subscription.updateOne({ _id: sub._id }, { expiresAt: newExpiresAt })
//   }
// })
