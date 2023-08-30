const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils/index")
const { CustomError } = require("../../utils/errors")
const { SubscriptionService } = require("./subscription.service")

const fetchSubscription = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    SubscriptionService.fetchSubscription(res.locals.jwt)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  fetchSubscription,
}
