const orderRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const { uploadManager } = require("../../utils/multer")

const { isAuthenticated, adminVerifier } = require("../../utils")
const {
  createOrderController,
  fetchOrderController,
  updateOrderController,
  uploadOrderFilesControllers,
} = require("./order.controller")

//authenticated routes go below here
orderRoute.use(isAuthenticated)

orderRoute
  .route("/")
  .post(adminVerifier, createOrderController)
  .get(fetchOrderController)

orderRoute.put(
  "/:id",
  adminVerifier,
  uploadManager("file").single("file"),
  uploadOrderFilesControllers
)

//routes
module.exports = orderRoute
