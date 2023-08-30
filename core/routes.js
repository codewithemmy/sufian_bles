const userRoute = require("../files/user/user.route")
const authRoute = require("../files/auth/auth.route")
const transactionRoute = require("../files/transaction/transaction.route")

const notificationRoute = require("../files/notification/notification.route")
const subscriptionRoute = require("../files/subscription/subscription.route")

const routes = (app) => {
  const base_url = "/api/v1"

  app.use(`${base_url}/user`, userRoute)
  app.use(`${base_url}/auth`, authRoute)
  app.use(`${base_url}/notification`, notificationRoute)
  app.use(`${base_url}/transaction`, transactionRoute)
  app.use(`${base_url}/subscription`, subscriptionRoute)
}

module.exports = routes
