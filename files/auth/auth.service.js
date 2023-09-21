const mongoose = require("mongoose")
const {
  AlphaNumeric,
  hashPassword,
  verifyToken,
  generateOtp,
} = require("../../utils")
const { sendMailNotification } = require("../../utils/email")
const createHash = require("../../utils/createHash")
const { sendSms } = require("../../utils/sms")
const { AuthFailure, AuthSuccess } = require("./auth.messages")
const { UserRepository } = require("../user/user.repository")
const {
  ConversationRepository,
} = require("../messages/conversations/conversation.repository")
const { AdminRepository } = require("../admin/admin.repository")
const { TextRepository } = require("../messages/texts/text.repository")
const { SocketRepository } = require("../messages/sockets/sockets.repository")

class AuthService {
  static async verifyUser({ body, io }) {
    const { otp } = body
    const confirmOtp = await UserRepository.findSingleUserWithParams({
      verificationOtp: otp,
    })

    if (!confirmOtp) return { success: false, msg: AuthFailure.VERIFY_OTP }

    confirmOtp.isVerified = true
    confirmOtp.verificationOtp = ""
    confirmOtp.verified = Date.now()
    await confirmOtp.save()

    //find one admin and use as entity two for conversation and text
    const fetchAdmin = await AdminRepository.fetchAdmin()

    //create socket for user verified
    await SocketRepository.createSocket({
      userId: fetchAdmin._id,
      modelType: "Admin",
    })

    //create a new conversation once a user is verified
    let conversationId
    const newConversation = await ConversationRepository.createConversation({
      entityOneId: new mongoose.Types.ObjectId(confirmOtp._id),
      entityOne: "User",
      entityTwoId: new mongoose.Types.ObjectId(fetchAdmin._id),
      entityTwo: "Admin",
    })

    conversationId = newConversation._id
    let message =
      "You are Welcome to Bles Client Platform... I am available to attend to your enquiries"

    await TextRepository.createText({
      senderId: new mongoose.Types.ObjectId(fetchAdmin._id),
      sender: "Admin",
      recipientId: new mongoose.Types.ObjectId(confirmOtp._id),
      recipient: "User",
      conversationId,
      message,
    })

    const socketDetails = await SocketRepository.findSingleSocket({
      userId: new mongoose.Types.ObjectId(fetchAdmin._id),
    })

    let socketDate = new Date()
    let createdAt = socketDate.toISOString()
    if (socketDetails)
      io.to(socketDetails.socketId).emit("private-message", {
        createdAt,
        recipientId: { _id: confirmOtp._id },
        message,
        conversationId,
        senderId: {
          _id: fetchAdmin._id,
          profileImage: fetchAdmin.profileImage,
          fullName: fetchAdmin.fullName,
          username: fetchAdmin.username,
          email: fetchAdmin.email,
        },
      })

    return {
      success: true,
      msg: AuthSuccess.VERIFY_OTP,
    }
  }

  static async forgotPassword(payload) {
    const { email } = payload
    const user = await UserRepository.findSingleUserWithParams({ email: email })

    if (!user) return { success: false, msg: AuthFailure.FETCH }

    const { otp, expiry } = generateOtp()

    //save otp to compare
    user.verificationOtp = otp
    await user.save()

    /**send otp to email or phone number*/
    const substitutional_parameters = {
      resetOtp: otp,
    }

    await sendMailNotification(
      email,
      "Reset Password",
      substitutional_parameters,
      "RESET_OTP"
    )

    return { success: true, msg: AuthSuccess.OTP_SENT, otp: otp, id: user._id }
  }

  static async resetPassword(body) {
    const { newPassword, email, otp } = body

    const findUser = await UserRepository.findSingleUserWithParams({
      email,
      verificationOtp: otp,
    })

    console.log("new", newPassword)
    if (!findUser) return { success: false, msg: AuthFailure.FETCH }

    findUser.password = await hashPassword(newPassword)
    findUser.verificationOtp = ""

    const saveUser = await findUser.save()

    if (!saveUser) return { success: false, msg: AuthFailure.PASSWORD_RESET }

    return { success: true, msg: AuthSuccess.PASSWORD_RESET }
  }

  static async verifyOtpService(payload) {
    const { email } = payload
    const user = await UserRepository.findSingleUserWithParams({ email: email })

    if (!user) return { success: false, msg: AuthFailure.FETCH }

    const { otp, expiry } = generateOtp()

    user.verificationOtp = otp

    await user.save()

    const substitutional_parameters = {
      resetOtp: otp,
    }

    await sendMailNotification(
      email,
      "Reset Password",
      substitutional_parameters,
      "RESET_OTP"
    )

    return {
      success: true,
      msg: AuthSuccess.OTP_SENT,
      otp: otp,
    }
  }
}

module.exports = AuthService
