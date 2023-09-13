const { Text } = require("./text.model")

class TextRepository {
  static createText(textPayload) {
    return Text.create(textPayload)
  }

  static async findSingleTextByParams(textPayload) {
    return Text.findOne({ ...textPayload })
  }

  static async fetchTextsByParams(textPayload) {
    const { limit, skip, sort, ...restOfPayload } = textPayload
    const texts = await Text.find({
      ...restOfPayload,
    })
      .populate({
        path: "senderId",
        select:
          "username profileImage fullName accountType email profileImage role image",
      })
      .populate({
        path: "recipientId",
        select:
          "username profileImage fullName accountType email profileImage role image",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return texts
  }
}

module.exports = { TextRepository }
