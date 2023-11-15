const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  checkOutValidation,
} = require("../../validations/transaction/checkOutValidation")

const {
  getTransactionController,
  checkoutTransactionController,
  retrieveTransactionController,
} = require("./controller/transaction.controller")

transactionRoute.get("/", getTransactionController)
transactionRoute.post(
  "/checkout",
  validate(checkSchema(checkOutValidation)),
  checkoutTransactionController
)
transactionRoute.get("/verify", retrieveTransactionController)

//routes
module.exports = transactionRoute
