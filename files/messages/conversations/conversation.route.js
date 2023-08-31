const conversationRoute = require("express").Router()
const { isAuthenticated } = require("../../../utils/index")
const { getConversationsController } = require("./conversation.controller")

conversationRoute.use(isAuthenticated)

//routes
conversationRoute.route("/").get(getConversationsController)

module.exports = conversationRoute
