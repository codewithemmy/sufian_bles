const subscriptionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")

const { isAuthenticated } = require("../../utils")
const { fetchSubscription } = require("./subscription.controller")

//authenticated routes go below here
subscriptionRoute.use(isAuthenticated)

subscriptionRoute.get("/", fetchSubscription)
//routes
module.exports = subscriptionRoute
