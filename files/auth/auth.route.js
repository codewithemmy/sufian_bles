
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
const {
  verifyUserController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
} = require("./controller/auth.controller")

const authRoute = require("express").Router()

//routes
authRoute.post("/verify", verifyUserController)
authRoute.post("/forgot-password", forgotPasswordController)
authRoute.patch("/reset-password/:id", resetPasswordController)
authRoute.post("/verify-otp", verifyOtpController)

module.exports = authRoute
  