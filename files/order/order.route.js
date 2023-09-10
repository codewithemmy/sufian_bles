const orderRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")

const { isAuthenticated, adminVerifier } = require("../../utils")
const {
  createOrderController,
  fetchOrderController,
} = require("./order.controller")

//authenticated routes go below here
orderRoute.use(isAuthenticated)

orderRoute
  .route("/")
  .post(adminVerifier, createOrderController)
  .get(fetchOrderController)

//routes
module.exports = orderRoute
