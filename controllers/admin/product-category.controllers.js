const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const searchHelper = require("../../helpers/search");
const filterStatusHelper = require("../../helpers/filterStatus");

// [GET] /admin/products-category
module.exports.index = async (req, res) => {

    // const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false,
    };

    // const objectSearch = searchHelper(req.query);
    // if(objectSearch.regex) {
    //     find.title = objectSearch.regex;
    // }

    const records = await ProductCategory.find(find);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: records,
        // filterStatus: filterStatus,
        // keyword: objectSearch.keyword,
    });
};

// [PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async(req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await ProductCategory.updateOne({ _id: id}, {status: status});
    req.flash("success", "Cập nhật trạng thái thành công!");

    res.redirect("back");
};

// [DELETE] /admin/products-category/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    // await Product.deleteOne({ _id: id });   // Xoa thang item trong database
    await ProductCategory.updateOne({ _id: id}, { 
        deleted: true, 
        deletedAt: new Date() 
    });    // Xoa mem

    req.flash("success", `Đã xóa thành công sản phẩm!`);

    res.redirect("back");
};

// [GET] /admin/products-category/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const records = await ProductCategory.findOne(find);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            product: records
        });

    } catch (error) {
        req.flash()
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async(req, res) => {
    const id = req.params.id;

    req.body.position = parseInt(req.body.position);

    // if(req.file) {
    //     req.body.thumbnail = `/uploads/${req.file.filename}`;
    // }

    try {
        await ProductCategory.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("success", "Cập nhật thất bại!");
    }

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};

// [GET] /admin/products-category/detail:id
module.exports.detail = async(req, res) => {
    try{
        const find = {
            deleted: false,
            _id: req.params.id,
        };

        const record = await ProductCategory.findOne(find);

        res.render("admin/pages/products-category/detail", {
            pageTitle: record.title,
            product: record,
        });
    } catch(error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    };

    function createTree(arr, parentId="") {
        const tree = [];
        arr.forEach((item) => {
            if(item.parent_id === parentId) {
                const newItem = item;
                const children = createTree(arr, item.id);
                if(children.length > 0) {
                    newItem.children = children;
                }
                tree.push(newItem);
            }
        });
        return tree;
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTree(records);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: newRecords,
    });
};

// [POST] : /admin/products-category/create
module.exports.createPost = async (req, res) => {
    if(req.body.position == "") {
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }
    
    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};