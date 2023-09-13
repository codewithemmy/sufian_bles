const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated, adminVerifier } = require("../../utils")

//controller files
const {
  createUserController,
  userLoginController,
} = require("../user/controllers/user.controller")
const {
  updateUserProfileController,
} = require("./controllers/profile.controller")

//routes
userRoute.route("/").post(createUserController)
userRoute.route("/login").post(userLoginController)

userRoute.patch(
  "/update/:id",
  uploadManager("image").single("profileImage"),
  updateUserProfileController
)

module.exports = userRoute
