const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils/index")
const { CustomError } = require("../../utils/errors")
const { OrderService } = require("./order.service")

const createOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(OrderService.createOrder(req.body))

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const fetchOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    OrderService.fetchOrder(req.query, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}
// const fetchSubscriptions = async (req, res, next) => {
//   const [error, data] = await manageAsyncOps(
//     OrderService.fetchEnterpriseSubscriptions({
//       user: res.locals.jwt,
//       query: req.query,
//     })
//   )
//   console.log("error", error)
//   if (error) return next(error)

//   if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

//   return responseHandler(res, SUCCESS, data)
// }

// const fetchSubscription = async (req, res, next) => {
//   const [error, data] = await manageAsyncOps(
//     OrderService.fetchEnterpriseSubscription(res.locals.jwt)
//   )
//   if (error) return next(error)

//   if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

//   return responseHandler(res, SUCCESS, data)
// }

module.exports = {
  createOrderController,
  fetchOrderController,
}
