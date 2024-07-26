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

    const userAdmin = room.users.filter(id => id.role == "superAdmin");

    chats.roomTitle = room.title;
    chats.id = room.id;
    chats.superAdmin = userAdmin[0].user_id;
    // End

    res.render("client/pages/chat/index", {
        pageTitle: "Chat",
        chats: chats,
    });
};

// [GET] /chat/editRoomTitle/:id
module.exports.editRoomTitle = async (req, res) => {
    const id = req.params.id;
    
    const room = await RoomChat.findOne({
        _id: id,
        deleted: false
    });

    res.render("client/pages/chat/editRoomTitle", {
        pageTitle: "Đổi tên phòng",
        room: room,
    });
};

// [PATCH] /chat/editRoomTitle/:id
module.exports.editRoomTitlePatch = async (req, res) => {
    const id = req.params.id;

    try {
        await RoomChat.updateOne({ _id: id }, {
            title: req.body.title
        });
    } catch (error) {
        res.redirect(`/chat/${id}`);
    }

    res.redirect(`/chat/${id}`);
};

// [GET] /chat/member/:id
module.exports.member = async (req, res) => {
    const id = req.params.id;
    const room = await RoomChat.findOne({ _id: id });

    let users = [];
    const membersName = await Promise.all(room.users.map(async (user) => {
        const name = await User.findOne({ _id: user.user_id}).select("id fullName");
        users.push(name);
    }));
    
    res.render("client/pages/chat/member", {
        pageTitle: "Các thành viên",
        room: room,
        users: users
    });
};

// [GET] /chat/addMember/:id
module.exports.addMember = async (req, res) => {
    const id = req.params.id;

    const room = await RoomChat.findOne({ _id: id });

    let members = room.users.map(user => user.user_id);

    const users = await User.find({ _id: { $nin: members }});

    res.render("client/pages/chat/addMember", {
        pageTitle: "Thêm thành viên",
        users: users,
        room: room 
    });
};

// [PATCH] /chat/addMember/:roomId/:userId
module.exports.addMemberPatch = async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    
    try {
        const user = await User.findOne({ _id: userId });

        const mem = {
            user_id: user.id,
            role: "user"
        };

        await RoomChat.updateOne({ _id: roomId }, {
            $push: { users: mem }
        });
        
    } catch (error) {
        req.flash("error", "Thêm thành viên bị lỗi!");
    }

    res.redirect("back");
}

// [GET] /chat/deleteMember/:roomId
module.exports.deleteMember = async (req, res) => { 
    const roomId = req.params.roomId;

    const room = await RoomChat.findOne({ _id: roomId });

    let membersId = room.users.map(user => user.user_id);
    const users = await User.find({ _id: { $in: membersId }}).select("fullName id");

    res.render("client/pages/chat/deleteMember", {
        pageTitle: "Xóa thành viên",
        users: users,
        room: room
    });
};

// [PATCH] /chat/deleteMember/:roomId/:userId
module.exports.deleteMemberPatch = async (req, res) => {

    const userId = req.params.userId;
    const roomId = req.params.roomId;

    try {
        await RoomChat.updateOne({ _id: roomId }, {
            $pull: { users: { user_id: userId }}
        });

        req.flash("success", "Xóa thành công!");
    } catch (error) {
        req.flash("error", "Xóa không thành công!");
    }
    res.redirect("back");
};