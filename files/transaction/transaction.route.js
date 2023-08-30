const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { isAuthenticated } = require("../../utils")

const {
  paymentIntentTransactionController,
  verifyTransactionController,
  getTransactionController,
} = require("./controller/transaction.controller")

transactionRoute.use(isAuthenticated)

transactionRoute.post("/payment-intent", paymentIntentTransactionController)
transactionRoute.patch("/verify", verifyTransactionController)
transactionRoute.get("/teacher", getTransactionController)

//routes
module.exports = transactionRoute
