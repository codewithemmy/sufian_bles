const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["stripe", "other"],
    },
    transactionId: {
      type: String,
    },
    priceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    subscriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    paymentFor: {
      type: String,
    },
    metaData: String,
  },
  { timestamps: true }
)

const transaction = mongoose.model(
  "Transaction",
  TransactionSchema,
  "transaction"
)

module.exports = { Transaction: transaction }
