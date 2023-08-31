const orderRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")

const { isAuthenticated } = require("../../utils")
const { createOrderController } = require("./order.controller")

//authenticated routes go below here
orderRoute.use(isAuthenticated)

orderRoute.route("/").post(createOrderController)

//routes
module.exports = orderRoute
