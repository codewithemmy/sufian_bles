const orderRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  uploadManager,
  uploadFileManager,
  videoManager,
} = require("../../utils/multer")

const { isAuthenticated, adminVerifier } = require("../../utils")
const {
  createOrderController,
  fetchOrderController,
  updateOrderController,
  uploadOrderFilesControllers,
  fetchOrderFilesController,
} = require("./order.controller")

//authenticated routes go below here
orderRoute.use(isAuthenticated)

orderRoute
  .route("/")
  .post(adminVerifier, createOrderController)
  .get(fetchOrderController)

orderRoute.route("/files").get(fetchOrderFilesController)

orderRoute.patch(
  "/file/:id",
  adminVerifier,
  uploadFileManager("files").single("file"),
  uploadOrderFilesControllers
)

orderRoute.patch(
  "/video/:id",
  adminVerifier,
  videoManager("files").single("file"),
  uploadOrderFilesControllers
)

//routes
module.exports = orderRoute
