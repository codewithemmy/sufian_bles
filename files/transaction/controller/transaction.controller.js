const { BAD_REQUEST, SUCCESS } = require("../../../constants/statusCode")
const { responseHandler } = require("../../../core/response")
const { manageAsyncOps } = require("../../../utils")
const { CustomError } = require("../../../utils/errors")
const { TransactionService } = require("../services/transaction.service")
// const crypto = require("crypto")

const paymentIntentTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.initiatePaymentIntentTransaction(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  paymentIntentTransactionController,
}

const verifyTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.verifyStripePaymentService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.getTransactionService(req.query, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const checkoutTransactionController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TransactionService.initiateCheckoutSession(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

// const verifyCheckoutController = async (req, res, next) => {
//   const [error, data] = await manageAsyncOps(
//     TransactionService.verifyCheckoutSession(req.body)
//   )

//   if (error) return next(error)

//   if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

//   return responseHandler(res, SUCCESS, data)
// }

module.exports = {
  paymentIntentTransactionController,
  verifyTransactionController,
  getTransactionController,
  checkoutTransactionController,
  // verifyCheckoutController,
}
