const { default: mongoose } = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  queryConstructor,
  sanitizePhoneNumber,
  generateOtp,
} = require("../../../utils")
const createHash = require("../../../utils/createHash")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")
const { LIMIT, SKIP, SORT } = require("../../../constants")
const {
  ProfileFailure,
  ProfileSuccess,
} = require("../messages/profile.messages")

class ProfileService {
  static async profileImage(payload, locals) {
    const { image } = payload
    const updateUser = await UserRepository.updateUserProfile(
      { _id: locals._id },
      {
        profileImage: image,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: ProfileSuccess.UPDATE }
  }

  static async getUserService(userPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User"
    )
    if (error) return { success: false, msg: error }

    const allUsers = await UserRepository.findAllUsersParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (allUsers.length < 1) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: allUsers }
  }

  static async UpdateUserService(body, locals) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const updateUser = await UserRepository.updateUserProfile(
      { _id: locals._id },
      {
        ...body,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async changePasswordService(body, locals) {
    const { currentPassword, newPassword } = body

    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const isPassword = await verifyPassword(currentPassword, user.password)

    if (!isPassword) return { success: false, msg: UserFailure.UPDATE }

    user.password = await hashPassword(newPassword)
    const updateUser = await user.save()

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async getUserProfileService(payload) {
    const user = await this.getUserService(payload)

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }

  static async generateImageService(payload) {
    const { prompt, size } = payload

    const result = await generateImage(prompt, size)

    if (!result) return { success: false, msg: `unable to fetch image` }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: result,
    }
  }

  static async IEPGoalService(payload) {
    const studentName = payload.studentName
    let prompt

    if (payload.type === "goal") {
      const {
        studentName,
        studentGrade,
        areaOfNeed,
        struggle,
        IEPDate,
        baseLine,
        studentInterest,
        criteria,
      } = payload

      prompt = `determine an IEP for ${studentName} with grade ${studentGrade} which area of need is ${areaOfNeed} that 
    struggle in ${struggle}. Targeting this date ${IEPDate} as objective to meet this baseline ${baseLine}, considering 
    ${studentName} interest which are ${studentInterest} and criteria ${criteria} to be met. what will be the Individualized 
    Education Plan for ${studentName}.
    Return response in the following JSON parsable format:
  {
    "goal": "answer", 
    "IEP": "answer"
  }
`
    }

    if (payload.type === "accommodation") {
      const { studentName, goal, information } = payload
      prompt = `based on ${studentName} with this goal: ${goal}. What is your Individualized 
    Education Plan (IEP) suggestion considering this: ${information}.
    Return response in the following JSON parsable format: 

  {
    "accommodation": "answer"
  }
`
    }

    if (payload.type === "presentLevel") {
      const { studentName, goal, information } = payload
      prompt = `based on ${studentName} with this goal: ${goal}. What is the Individualized 
    Education Plan (IEP) present level for ${studentName} considering this: ${information}.
    Return response in the following JSON parsable format:
  {
    "presentLevel": "answer"
  }
`
    }

    if (payload.type === "progressMonitoring") {
      const { studentName, goal } = payload
      prompt = `As a teacher, using Individualized 
    Education Plan (IEP) - List or outline different ways to monitor the progress of ${studentName} with this goal: ${goal}.
    Return response in the following JSON parsable format:
  {
    "progressMonitoring": "answer"
  }
`
    }

    const result = await completionIEP(prompt)

    if (!result)
      return { success: false, msg: `something went wrong, try again` }

    return {
      success: true,
      msg: `IEP fetched successfully`,
      data: result,
      student: studentName,
    }
  }
}

module.exports = { ProfileService }
