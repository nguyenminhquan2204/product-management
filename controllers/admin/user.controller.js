const md5 = require("md5");

const User = require("../../models/user.model");
const Role = require("../../models/role.model");

const systemConfig = require("../../config/system");

// [GET] /admin/users
module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    };

    const records = await User.find(find).select("-password -tokenUser");
    
    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        });
        record.role = role;
    }
    
    res.render("admin/pages/users/index", {
        pageTitle: "Danh sách người dùng",
        records: records,
    });
};

// [GET] /admin/users/create
module.exports.create = async (req, res) => {

    res.render("admin/pages/users/create", {
        pageTitle: "Tạo mới tài khoản",
    });
};

// [POST] /admin/users/create
module.exports.createPost = async (req, res) => {
    const emailExist = await User.findOne({
        email: req.body.email,
        deleted: false,
    });

    if(emailExist) {
        req.flash("error", `Email ${req.body.email} này đã tồn tại`);
        res.redirect("back");
    } else {
        req.body.password = md5(req.body.password);

        const record = new User(req.body);
        await record.save();

        res.redirect(`${systemConfig.prefixAdmin}/users`);
    }
};

// [GET] /admin/users/edit/:id
module.exports.edit = async (req, res) => {
    let find = {
        _id: req.params.id,
        deleted: false,
    };

    try {
        const data = await User.findOne(find);
        // data.password = md5(data.password);
        const roles = await Role.find({
            deleted: false,
        });

        res.render("admin/pages/users/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
            roles: roles,
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }
};

// [PATCH] /admin/users/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    const emailExist = await User.findOne({
        // tim kiem nhung id khac id nay
        _id: { $ne: id},
        deleted: false,
        email: req.body.email,
    });

    if(emailExist) {
        req.flash("error", `Email ${req.body.email} đã tồn tại!`);
    } else {
        if(req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }
        await User.updateOne({ _id: id }, req.body);
        // console.log(req.body);
        req.flash("success", "Cập nhật tài khoản thành công!");
    }

    res.redirect("back");
};

// [GET] /admin/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const data = await Account.findOne({
            deleted: false,
            _id: req.params.id
        });

        if(data.role_id) {
            const role = await Role.findOne({
                _id: data.role_id,
            }).select("title");

            data['role'] = role;
        }   

        res.render("admin/pages/accounts/detail", {
            pageTitle: data.fullName,
            account: data
        });
    } catch (error) {
        req.flash("error", "Lỗi xảy ra!!");
        res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
    }
};

// [GET] /admin/users/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, {
            status: req.params.status
        });

        req.flash("success", "Cập nhật trạng thái thành công.");

    } catch (error) {
        req.flash("error", "Lỗi xảy ra.!!");
    }
    res.redirect(`${systemConfig.prefixAdmin}/users`);
};

// [DELETE] /admin/users/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, {
            deleted: true,
            deletedAt: new Date()
        });

        req.flash("success", "Xoá thành công.!");
    } catch (error) {
        req.flash("error", "Lỗi xảy ra.!!");
        res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }
};