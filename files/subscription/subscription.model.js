const mongoose = require("mongoose")
// const cron = require("node-cron")

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired"],
    },
    transactionId: {
      type: mongoose.Types.ObjectId,
      ref: "Transaction",
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

const subscription = mongoose.model(
  "Subscription",
  SubscriptionSchema,
  "subscription"
)

module.exports = { Subscription: subscription }
