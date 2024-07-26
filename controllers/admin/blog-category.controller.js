const BlogCategory = require("../../models/blog-category.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const createTreeHelper = require("../../helpers/createTree");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/blogs-category
module.exports.index = async (req, res) => {

    const find = {
        deleted: false
    };

    const filterStatus = filterStatusHelper(req.query);

    if(req.query.status) {
        find.status = req.query.status;
    }

    // Search
    const objectSearch = searchHelper(req.query);
    if(objectSearch.regex) {
        find.title = objectSearch.regex;
        // console.log(find.title);
    }
    // End Search

    // const countProductCategorys = await BlogCategory.countDocuments(find);
    // let objectPagination = paginationHelper(
    //     {
    //         currentPage: 1,
    //         limitItems: 20
    //     },
    //     req.query,
    //     countProductCategorys
    // );

    const data = await BlogCategory.find(find);

    const newRecords = createTreeHelper.tree(data);

    res.render("admin/pages/blogs-category/index", {
        pageTitle: "Danh mục bài viết",
        data: newRecords,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        // pagination: objectPagination
    });
};

// [GET] /admin/blogs-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await BlogCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/blogs-category/create", {
        pageTitle: "Thêm mới danh mục bài viết",
        records: newRecords
    });
};

// [POST] /admin/blogs-category/create
module.exports.createPost = async (req, res) => {
    
    if(req.body.position == "") {
        const count = await BlogCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    const record = new BlogCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/blogs-category`);

};

// [PATCH] /admin/blogs-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await BlogCategory.updateOne({ _id: id}, { status: status });
    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
};

// [GET] /admin/blogs-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const record = await BlogCategory.findOne(find);

        let recordParent;

        if(record.parent_id) {
            recordParent = await BlogCategory.findOne({ deleted: false, _id: record.parent_id });
        }

        res.render("admin/pages/blogs-category/detail", {
            pageTitle: record.title,
            product: record,
            productParent: recordParent,
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/blogs-category`);
    }
};

// [GET] /admin/blogs-category/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const blog = await BlogCategory.findOne(find);

        res.render("admin/pages/blogs-category/edit", {
            pageTitle: "Chỉnh sửa danh mục bài viết",
            blog: blog
        });   
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/blogs-category`);
    }
};

// [PATCH] /admin/blogs-category/edit/:id
module.exports.editPatch = async(req, res) => {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    try {
        await BlogCategory.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!")
    }

    res.redirect(`${systemConfig.prefixAdmin}/blogs-category`);
};

// [DELETE] /admin/blogs-category/delete/:id
module.exports.deleteBlog = async(req, res) => {
    const id = req.params.id;

    await BlogCategory.updateOne({ _id: id }, {
        deletedAt: new Date(),
        deleted: true
    });

    req.flash("success", `Đã xóa thành công sản phẩm!`);

    res.redirect("back");
};

// [PATCH] /admin/blogs-category/change-multi
module.exports.changeMulti = async(req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await BlogCategory.updateMany({ _id: { $in: ids }}, { status: "active"});
            req.flash("success", `Cập nhật thành công ${ids.length} sản phẩm!`);
            break;

        case "inactive":
            await BlogCategory.updateMany({ _id: { $in: ids }}, { status: "inactive"});
            req.flash("success", `Cập nhật thành công ${ids.length} sản phẩm!`);
            break;

        case "delete-all":
            await BlogCategory.updateMany({ _id: { $in: ids }}, {
                deleted: true,
                deletedAt: new Date()
            });
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        
        case "change-position":
            for(const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await BlogCategory.updateOne({ _id: id}, { position: position });
            }

            req.flash("success", `Đã cập nhật lại vị trí thành công ${ids.length} sản phẩm!`);
            break;

        default:
            break;
    }

    res.redirect("back");
};