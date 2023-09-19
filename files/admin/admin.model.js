const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
    },
    image: String,
  },
  { timestamps: true }
)

const admin = mongoose.model("Admin", adminSchema, "admin")

module.exports = { Admin: admin }
