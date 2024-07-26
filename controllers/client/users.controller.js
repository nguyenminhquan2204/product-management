const User = require("../../models/user.model");

const usersSocket = require("../../sockets/client/users.socket");

// [GET] /users/not-friend
module.exports.notFriend = async (req, res) => {
    // Socket
    usersSocket(res);
    // End Socket

    const userId = res.locals.user.id;
    
    const myUser = await User.findOne({
        _id: userId
     });

    const requestFriends = myUser.requestFriends
    const acceptFriends = myUser.acceptFriends;

    const users = await User.find({
        $and: [
            { _id: { $ne: userId }},
            { _id: { $nin: requestFriends }},
            { _id: { $nin: acceptFriends }},
        ],
        status: "active",
        deleted: false
    }).select("avatar fullName");

    res.render("client/pages/users/not-friend", {
        pageTitle: "Danh sách người dùng",
        users: users
    });
};

// [GET] /users/request
module.exports.request = async (req, res) => {
    // Socket
    usersSocket(res);
    // End Socket

    const userId = res.locals.user.id;
    
    const myUser = await User.findOne({
        _id: userId
    });

    const requestFriends = myUser.requestFriends;

    const users = await User.find({
        $and: [
            { _id: { $ne: userId }},
            { _id: { $in: requestFriends}}
        ],
        status: "active",
        deleted: false, 
    }).select("id avatar fullName");

    res.render("client/pages/users/request", {
        pageTitle: "Lời mời đã gửi",
        users: users,
    });
};

// [GET] /users/accept
module.exports.accept = async (req, res) => {
    // Socket
    usersSocket(res);
    // End Socket
    
    const userId = res.locals.user.id;
    
    const myUser = await User.findOne({
        _id: userId
    });

    const acceptFriends = myUser.acceptFriends;

    const users = await User.find({
        $and: [
            { _id: { $ne: userId }},
            { _id: { $in: acceptFriends}}
        ],
        status: "active",
        deleted: false, 
    }).select("id avatar fullName");

    res.render("client/pages/users/accept", {
        pageTitle: "Lời mời đã nhận",
        users: users,
    });
};

// [GET] /users/friends
module.exports.friends = async (req, res) => {
    // Socket 
    usersSocket(res);
    // End Socket

    const userId = res.locals.user.id;

    const myUser = await User.findOne({
        _id: userId
    });

    const friendList = myUser.friendList;

    const friendListId = friendList.map(item => item.user_id);

    const users = await User.find({
        _id: { $in: friendListId },
        status: "active",
        deleted: false
    }).select("id avatar fullName statusOnline");

    users.forEach(user => {
        const infoUser = friendList.find(item => item.user_id == user.id);
        user.roomChatId = infoUser.room_chat_id;
    });

    res.render("client/pages/users/friends", {
        pageTitle: "Danh sách bạn bè",
        users: users
    });
}

// [GET] /users/unfriend/:id
module.exports.unFriend = async (req, res) => {
    const myUser = await User.findOne({
        tokenUser: req.cookies.tokenUser,
    });
    const user = await User.findOne({
        _id: req.params.id
    });

    try {
        await User.updateOne({ _id: myUser.id }, {
            $pull: { friendList: { user_id: user.id }}
        });

        await User.updateOne({ _id: user.id }, {
            $pull: { friendList: { user_id: myUser.id }}
        });

        req.flash("success", "Hủy kết thành công!");
    } catch (error) {
        req.flash("error", "Hủy kết bạn không thành công!");
    }

    res.redirect("back");
};