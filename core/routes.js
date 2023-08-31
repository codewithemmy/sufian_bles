const userRoute = require("../files/user/user.route")
const authRoute = require("../files/auth/auth.route")
const transactionRoute = require("../files/transaction/transaction.route")
const notificationRoute = require("../files/notification/notification.route")

const textRoute = require("../files/messages/texts/text.route")
const conversationRoute = require("../files/messages/conversations/conversation.route")
const adminRoute = require("../files/admin/admin.routes")
const subscriptionPlansRoute = require("../files/subscription_plan/subscriptionPlan.routes")
const orderRoute = require("../files/order/order.route")

const routes = (app) => {
  const base_url = "/api/v1"

  app.use(`${base_url}/user`, userRoute)
  app.use(`${base_url}/auth`, authRoute)
  app.use(`${base_url}/notification`, notificationRoute)
  app.use(`${base_url}/transaction`, transactionRoute)
  app.use(`${base_url}/chats`, textRoute)
  app.use(`${base_url}/conversation`, conversationRoute)
  app.use(`${base_url}/admin`, adminRoute)
  app.use(`${base_url}/subscription-plan`, subscriptionPlansRoute)

  app.use(`${base_url}/order`, orderRoute)
}

module.exports = routes
