const User = require("../../models/user.model");
const RoomChat = require("../../models/room-chat.model");

module.exports = async (res) => {
    _io.once("connection", (socket) => {
        // Người dùng gửi yêu cầu kết bạn
        socket.on("CLIENT_ADD_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // console.log(myUserId); //id cua A
            // console.log(userId); //id cua B

            // Them id cua A vao acceptFriends cua B
            const existUserAInB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            });

            if (!existUserAInB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: {
                        acceptFriends: myUserId
                    }
                });
            }

            // Them id cua B vao requestFriends cua A
            const existUserBInA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            });

            if (!existUserBInA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: {
                        requestFriends: userId
                    }
                });
            }

            // Lấy độ dài acceptFriends
            const infoUsers = await User.findOne({
                _id: userId
            });

            const lengthAcceptFriends = infoUsers.acceptFriends.length;

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            });

            // Lấy thông tin ... return ... 
            const infoUserA = await User.findOne({
                _id: myUserId,
            }).select("id avatar fullName");

            socket.broadcast.emit("SERVER_RETURN_INFO_ACCEPT_FRIEND", {
                userId: userId,
                infoUserA: infoUserA
            });
        });

        // Người dùng hủy gửi yêu cầu kết bạn
        socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // Xoa id cua A vao acceptFriends cua B
            const existUserAInB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            });

            if (existUserAInB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: {
                        acceptFriends: myUserId
                    }
                });
            }

            // Xoa id cua B vao requestFriends cua A
            const existUserBInA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            });

            if (existUserBInA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: {
                        requestFriends: userId
                    }
                });
            }

            const infoUsers = await User.findOne({
                _id: userId
            });

            const lengthAcceptFriends = infoUsers.acceptFriends.length;

            socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
                userId: userId,
                lengthAcceptFriends: lengthAcceptFriends
            });

            socket.broadcast.emit("SERVER_RETURN_USER_ID_CANCEL_FRIEND", {
                userId: userId,
                userIdA: myUserId
            });
        });

        // Người dùng từ chối kết bạn
        socket.on("CLIENT_REFUSE_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            // Xoa id cua A vao acceptFriends cua B
            const existUserAInB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            });

            if (existUserAInB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: {
                        acceptFriends: userId
                    }
                });
            }

            // Xoa id cua B vao requestFriends cua A
            const existUserBInA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            });

            if (existUserBInA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: {
                        requestFriends: myUserId
                    }
                });
            }
        });

        // Người dùng chấp nhận kết bạn
        socket.on("CLIENT_ACCEPT_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;

            const existUserAInB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            });

            const existUserBInA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            });

            // Tao phong Chat
            let roomChat;
            if(existUserAInB && existUserBInA) {
                roomChat = new RoomChat({
                    typeRoom: "friend",
                    users: [
                        {
                            user_id: userId,
                            role: "superAdmin"
                        },
                        {
                            user_id: myUserId,
                            role: "superAdmin"
                        }
                    ]
                });
                await roomChat.save();
            }
            // End

            // Thêm {user_id, room_chat_id} của A vào friendsList của B
            // Xoa id cua A vao acceptFriends cua B
            if (existUserAInB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: {
                        friendList: {
                            user_id: userId,
                            room_chat_id: roomChat.id,
                        }
                    },
                    $pull: {
                        acceptFriends: userId
                    }
                });
            }

            // Thêm {user_id, room_chat_id} của B vào friendsList của A
            // Xoa id cua B vao requestFriends cua A
            if (existUserBInA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: {
                        friendList: {
                            user_id: myUserId,
                            room_chat_id: roomChat.id,
                        }
                    },
                    $pull: {
                        requestFriends: myUserId
                    }
                });
            }
        });
    });
}