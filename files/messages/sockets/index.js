const { default: mongoose } = require("mongoose")
const { SocketRepository } = require("./sockets.repository")
const fs = require("fs")

let onlineUsers = []
module.exports.socketConnection = async (io) => {
  io.on("connection", async (socket) => {
    console.log(`⚡⚡: ${socket.id} user just connected!`)

    socket.on("typing", (data) => {
      if (data.typing == true) io.emit("display", data)
      else io.emit("display", data)
    })

    socket.on("onlineUsers", (userId) => {
      !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({
          userId,
          socketId: socket.id,
        })
      console.log("onlineUsers", onlineUsers)
      io.emit("onlineUsers", onlineUsers)
    })

    socket.on("join", async (obj) => {
      try {
        //check to delete the socket id with the userId
        await SocketRepository.deleteMany({
          userId: new mongoose.Types.ObjectId(obj.userId),
        })

        //create a new socket
        const socketDetails = await SocketRepository.createSocket({
          socketId: socket.id,
          userId: obj.userId,
          modelType: obj.type,
        })

        //emit error sockets is not generated
        if (!socketDetails._id) {
          socket.emit("join", `Error: ${data.message}`)
        } else {
          socket.emit("join", "Connection Successful")
        }
      } catch (error) {
        console.log("socket error", error)
      }
    })

    socket.on("offline", () => {
      // remove user from active users
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
      console.log("user is offline", onlineUsers)
      // send all online users to all users
      io.emit("get-users", onlineUsers)
    })

    socket.on("disconnect", async () => {
      await SocketRepository.deleteUser(socket.id)
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
      console.log("user disconnected", onlineUsers)
      // send all online users to all users
      io.emit("get-users", onlineUsers)
    })

    socket.on("error", (error) => {
      fs.writeFileSync("errorlog.txt", `Error: ${error.message} /n`)
    })
  })
}
