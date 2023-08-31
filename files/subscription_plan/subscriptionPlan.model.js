const mongoose = require("mongoose")

const subscriptionPlanSchema = new mongoose.Schema({
  service: {
    type: String,
  },
  planType: {
    starter: {
      amount: Number,
      deliveryTime: Number,
      numberOfPages: Number,
      designCustomization: Boolean,
      contentUpload: Boolean,
      responsiveDesign: Boolean,
    },
    pro: {
      amount: Number,
      deliveryTime: Number,
      numberOfPages: Number,
      designCustomization: Boolean,
      contentUpload: Boolean,
      responsiveDesign: Boolean,
    },
    max: {
      amount: Number,
      deliveryTime: Number,
      numberOfPages: Number,
      designCustomization: Boolean,
      contentUpload: Boolean,
      responsiveDesign: Boolean,
    },
  },
  projectDetails: String,
  image: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
})

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
)

module.exports = SubscriptionPlan
