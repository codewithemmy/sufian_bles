const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: { type: String },
    profileImage: { type: String },
    accountType: {
      type: String,
      required: true,
      enum: ["User"],
      default: "User",
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordToken: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    verificationOtp: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    verified: { type: Date, default: Date.now() },
  },
  { timestamps: true }
)

const user = mongoose.model("User", userSchema, "user")

module.exports = { User: user }
