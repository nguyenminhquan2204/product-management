const User = require("../../models/user.model");

module.exports = async (res) => {
    _io.once("connection", (socket) => {
        socket.on("CLIENT_ADD_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); //id cua A
            // console.log(userId); //id cua B

            // Them id cua A vao acceptFriends cua B
            const existUserAInB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            });

            if(!existUserAInB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: { acceptFriends: myUserId }
                });
            }

            // Them id cua B vao requestFriends cua A
            const existUserBInA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            });

            if(!existUserBInA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: { requestFriends: userId }
                });
            }
        });

    });
}