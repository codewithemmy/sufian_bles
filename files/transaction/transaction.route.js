const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { isAuthenticated } = require("../../utils")

const {
  verifyTransactionController,
  getTransactionController,
  checkoutTransactionController,
} = require("./controller/transaction.controller")

// transactionRoute.use(isAuthenticated)

transactionRoute.patch("/verify", verifyTransactionController)
transactionRoute.get("/", getTransactionController)
transactionRoute.post("/checkout", checkoutTransactionController)

//routes
module.exports = transactionRoute
