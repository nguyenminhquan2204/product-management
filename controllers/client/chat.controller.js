const Chat = require("../../models/chat.model");
const RoomChat = require("../../models/room-chat.model");
const User = require("../../models/user.model");

const chatSocket = require("../../sockets/client/chat.socket");

// [GET] /chat/:roomChatId
module.exports.index = async (req, res) => {
    const roomChatId = req.params.roomChatId;

    // SocketIO
    chatSocket(req, res);
    // End SocketIO

    // Lấy ra data
    const chats = await Chat.find({
        room_chat_id: roomChatId,
        deleted: false
    });

    for(const chat of chats) {
        const infoUser = await User.findOne({
            _id: chat.user_id
        }).select("id fullName");

        chat.infoUser = infoUser;
    }

    const room = await RoomChat.findOne({
        _id: roomChatId
    });

    chats.roomTitle = room.title;
    // End
    res.render("client/pages/chat/index", {
        pageTitle: "Chat",
        chats: chats
    });
};