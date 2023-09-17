const mongoose = require("mongoose")

const conversationSchema = new mongoose.Schema(
  {
    entityOne: {
      type: String,
      enum: ["Admin", "User"],
    },
    entityOneId: {
      type: mongoose.Types.ObjectId,
      refPath: "entityOne",
    },
    entityTwo: {
      type: String,
      enum: ["Admin", "User"],
    },
    entityTwoId: {
      type: mongoose.Types.ObjectId,
      refPath: "entityTwo",
    },
    orderId: {
      type: String,
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Text",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const conversation = mongoose.model(
  "Conversation",
  conversationSchema,
  "conversation"
)

module.exports = { Conversation: conversation }
