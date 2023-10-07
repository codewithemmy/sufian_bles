const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils/index")
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

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateOrderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    OrderService.updateOrderService(req.params.id, req.body, res.locals.jwt._id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const uploadOrderFilesControllers = async (req, res, next) => {
  let value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    OrderService.uploadOrderFileService(value, req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, 200, data)
}

const fetchOrderFilesController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    OrderService.fetchOrder(req.query, res.locals.jwt)
  )
  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createOrderController,
  fetchOrderController,
  updateOrderController,
  uploadOrderFilesControllers,
  fetchOrderFilesController,
}
