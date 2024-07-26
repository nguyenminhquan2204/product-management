const md5 = require("md5");

const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");

const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");

// [GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký tài khoản",

    });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    // console.log(req.body);
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(existEmail) {
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    } 

    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();

    res.cookie("tokenUser", user.tokenUser);

    req.flash("success", "Đăng ký tài khoản thành công!");

    res.redirect("/");
};

// [GET] /user/login
module.exports.login = async (req, res) => {
    
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản",

    });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user) {
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    } 

    if(md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu!");
        res.redirect("back");
        return;
    } 

    if(user.status == "inactive") {
        req.flash("error", "Tài khoản đang bị khóa!");
        res.redirect("back");
        return;
    } 

    res.cookie("tokenUser", user.tokenUser);

    await User.updateOne({ _id: user.id }, { 
        statusOnline: "online" 
    });

    _io.once("connection", (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_ONLINE", user.id);
    });

    // Lưu user_id vào collection Cart
    await Cart.updateOne({ _id: req.cookies.cartId }, { user_id: user.id });

    res.redirect("/");
};

// [GET] /user/logout
module.exports.logout = async (req, res) => {
    await User.updateOne({ _id: res.locals.user.id }, { 
        statusOnline: "offline" 
    });

    _io.once("connection", (socket) => {
        socket.broadcast.emit("SERVER_RETURN_USER_OFFLINE", res.locals.user.id);
    });

    res.clearCookie("tokenUser");

    res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Lấy lại mật khẩu",
    });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });
    
    if(!user) {
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    } 

    //---------------------
    //B1: Tạo mã OTP và lưu thông OTP, email vào collection forgot-password
    const otp = generateHelper.generateRandomNumber(8);

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    //B2: Gửi mã OTP qua email của user
    const subject = `Mã OTP xác minh lấy lại mật khẩu`;
    const html = `Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là 3 phút. Lưu ý không được để lệ mã OTP`;
    sendMailHelper.sendMail(email, subject, html);

    //---------------------

    res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;

    res.render("client/pages/user/otp-password", {
        pageTitle: "Nhập mã OTP",
        email: email
    });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if(!result) {
        req.flash("error", "Mã OTP không hợp lệ!");
        res.redirect("back");
        return;
    }

    const user = await User.findOne({
        email: email
    });

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password", {
        pageTitle: "Đổi mật khẩu",
    })
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({ tokenUser: tokenUser }, { password: md5(password) });

    req.flash("success", "Đổi mật khẩu thành công!");
    res.redirect("/");
};

// [GET] /user/info/:id
module.exports.info = async (req, res) => {
    const user = await User.findOne({
        deleted: false,
        _id: req.params.id
    });
    
    let listFriend = [];

    if(user.friendList) {
        const list = user.friendList.map(async (user) => {
            const friend = await User.findOne({
                _id: user.user_id,
                deleted: false
            }).select("fullName");
    
            return friend;
        });
        
        listFriend = await Promise.all(list);
    }
    

    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản",
        listFriend: listFriend,
        myUser: user
    });
};

// [GET] /user/editInfo/:id
module.exports.editInfo = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });

    let users = [];
    const membersName = await Promise.all(user.friendList.map(async (user) => {
        const name = await User.findOne({ _id: user.user_id}).select("fullName");
        users.push(name);
    }));
    
    let nameFriends = "";
    users.forEach(user => {
        nameFriends += user.fullName + ", "
    });

    nameFriends = nameFriends.slice(0, nameFriends.length-2);
    console.log(nameFriends);
    

    res.render("client/pages/user/edit", {
        pageTitle: "Chỉnh sửa thông tin",
        user: user,
        nameFriends: nameFriends
    });
};

// [PATCH] /user/editInfo/:id
module.exports.editInfoPatch = async (req, res) => {
    const id = req.params.id;

    try {
        await User.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thông tin thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thông tin thất bại!");
    }

    res.redirect(`/user/info/${id}`)
};