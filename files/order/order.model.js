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
    status: {
      type: String,
      enum: ["Complete", "Active", "Delivered", "Cancelled", "Pending"],
      default: "Pending",
    },
    expiresAt: {
      type: Number,
    },
  },
  { timestamps: true }
)

// cron.schedule("0 0 * * *", async () => {
//   const subscriptions = await subscription.find({ expiresAt: { $gt: 0 } })

//   for (const sub of subscriptions) {
//     const newExpiresAt = sub.expiresAt - 1 // Deduct 1 day from expiresAt
//     await subscription.updateOne({ _id: sub._id }, { expiresAt: newExpiresAt })
//   }
// })

const order = mongoose.model("Order", orderSchema, "order")

module.exports = { Order: order }
