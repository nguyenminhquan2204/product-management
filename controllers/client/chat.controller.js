const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");

// [GET] /chat/
module.exports.index = async (req, res) => {
    const userId = res.locals.user.id;
    const fullName = res.locals.user.fullName;

    // SocketIO
    _io.once("connection", (socket) => {
        // console.log("a user connected", socket.id);
        socket.on("CLIENT_SEND_MESSAGE", async (content) => {
            // console.log(userId);
            // console.log(content);

            // Lưu vào database
            const chat = new Chat({
                user_id: userId,
                content: content
            });
            await chat.save();

            _io.emit("SERVER_RETURN_MESSAGE", {
                userId: userId,
                fullName: fullName,
                content: content
            });
        });
    });
    // End SocketIO

    // Lấy ra data
    const chats = await Chat.find({
        deleted: false
    });

    for(const chat of chats) {
        const infoUser = await User.findOne({
            _id: chat.user_id
        }).select("id fullName");

        chat.infoUser = infoUser;
    }
    // End
    res.render("client/pages/chat/index", {
        pageTitle: "Chat",
        chats: chats
    });
};