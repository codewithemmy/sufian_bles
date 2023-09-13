const adminRoute = require("express").Router()
const { isAuthenticated, adminVerifier } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const {
  fetchOrderController,
  updateOrderController,
} = require("../order/order.controller")
const { getUserController } = require("../user/controllers/profile.controller")
const {
  adminSignUpController,
  adminLogin,
  getAdminController,
} = require("./admin.controller")

//admin route
adminRoute.route("/").post(adminSignUpController)
adminRoute.route("/login").post(adminLogin)
adminRoute.route("/profile").get(getAdminController)

adminRoute.use(isAuthenticated)

//user
adminRoute.route("/user").get(getUserController)

//order
adminRoute.route("/order").get(adminVerifier, fetchOrderController)
adminRoute.route("/order/:id").patch(adminVerifier, updateOrderController)

module.exports = adminRoute
