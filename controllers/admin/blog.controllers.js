const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/blog-category.model");

const systemConfig = require("../../config/system");

const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/blogs/
module.exports.index = async(req, res) => {

    const find = {
        deleted: false
    };

    const filterStatus = filterStatusHelper(req.query);

    if(req.query.status) {
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);
    if(objectSearch.regex) {
        find.title = objectSearch.regex;
        // console.log(find.title);
    }

    const countProductCategorys = await Blog.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProductCategorys
    );

    let sort = {};
    if(req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }

    const blogs = await Blog.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    res.render("admin/pages/blogs/index", {
        pageTitle: "Danh sách bài viết",
        blogs: blogs,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,

    });
};

// [GET] /admin/blogs/create
module.exports.create = async(req, res) => {

    const category = await BlogCategory.find({ deleted: false });

    const newCategory = createTreeHelper.tree(category);

    res.render("admin/pages/blogs/create", {
        pageTitle: "Thêm mới bài viết",
        category: newCategory
    });
};

// [POST] /admin/blogs/create
module.exports.createPost = async(req,res) => {

    if(req.body.position == "") {
        const countProducts = await Blog.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };
    
    const blog = new Blog(req.body);
    await blog.save();

    res.redirect(`${systemConfig.prefixAdmin}/blogs`);
};

// [PATCH] /admin/blogs/change-status/:status/:id
module.exports.changeStatus = async(req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updateAt: new Date()
    };

    await Blog.updateOne({ _id: id }, { 
        status: status,
        $push: { updatedBy: updatedBy }
    });

    req.flash("success", "Đã cập nhật trạng thái thành công!");
    res.redirect("back");
};

// [GET] /admin/blogs/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const data = await Blog.findOne(find);

        res.render("admin/pages/blogs/detail", {
            pageTitle: data.title,
            blog: data
        });

    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/blogs`);
    }
};

// [GET] /admin/blogs/edit/:id
module.exports.edit = async(req, res) => {
    try{
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const blog = await Blog.findOne(find);

        res.render("admin/pages/blogs/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            blog: blog
        });   
    } catch(error) {
        res.redirect(`${systemConfig.prefixAdmin}/blogs`);
    }
};

// [PATCH] /admin/blogs/edit/:id
module.exports.editPatch = async(req, res) => {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    try {
        await Blog.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }

    res.redirect(`${systemConfig.prefixAdmin}/blogs`);
};

// [DELETE] /admin/blogs/delete/:id
module.exports.deleteBlog = async(req, res) => {
    const id = req.params.id;

    await Blog.updateOne({ _id: id }, {
        deletedAt: new Date(),
        deleted: true
    });

    req.flash("success", `Đã xóa thành công sản phẩm!`);

    res.redirect("back");
};

// [PATCH] /admin/blogs/change-multi
module.exports.changeMulti = async(req, res) => {
    console.log("QUan");
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Blog.updateMany({ _id: { $in: ids }}, { status: "active"});
            req.flash("success", `Cập nhật thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await Blog.updateMany({ _id: { $in: ids }}, { status: "inactive"});
            req.flash("success", `Cập nhật thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await Blog.updateMany({ _id: { $in: ids }}, {
                deleted: true,
                deletedAt: new Date()
            });
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        
        case "change-position":
            for(const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await Blog.updateOne({ _id: id}, { position: position });
            }

            req.flash("success", `Đã cập nhật lại vị trí thành công ${ids.length} sản phẩm!`);
            break;

        default:
            break;
    }

    res.redirect("back");
};