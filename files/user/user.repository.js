const { User } = require("./user.model")
const mongoose = require("mongoose")

class UserRepository {
  static async create(payload) {
    return await User.create(payload)
  }

  static async findUserWithParams(userPayload, select) {
    return await User.find({ ...userPayload }).select(select)
  }

  static async findSingleUserWithParams(userPayload, select) {
    const user = await User.findOne({ ...userPayload }).select(select)

    return user
  }

  static async validateUser(userPayload) {
    return User.exists({ ...userPayload })
  }

  static async findAllUsersParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const user = await User.find({ ...restOfPayload }, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateUserProfile(payload, params) {
    return User.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async updateUserById(id, params) {
    return User.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { ...params },
      { new: true, runValidators: true }
    )
  }

  static async countsByStatus(query) {
    const userCount = await User.countDocuments().where({ ...query })
    return userCount
  }

  static async deleteAccount(payload) {
    const deleteAccount = await User.findOneAndDelete({
      ...payload,
    })

    return deleteAccount
  }
}

module.exports = { UserRepository }
