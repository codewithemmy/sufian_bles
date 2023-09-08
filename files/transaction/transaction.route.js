const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { isAuthenticated } = require("../../utils")

const {
  paymentIntentTransactionController,
  verifyTransactionController,
  getTransactionController,
  checkoutTransactionController,
  verifyCheckoutController,
} = require("./controller/transaction.controller")

// transactionRoute.use(isAuthenticated)

transactionRoute.post("/payment-intent", paymentIntentTransactionController)
transactionRoute.patch("/verify", verifyTransactionController)
transactionRoute.get("/", getTransactionController)
transactionRoute.post("/checkout", checkoutTransactionController)
// transactionRoute.post("/verify-checkout", verifyCheckoutController)

//routes
module.exports = transactionRoute
