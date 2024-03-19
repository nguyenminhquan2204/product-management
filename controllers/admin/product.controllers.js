const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    
    const filterStatus = filterStatusHelper(req.query);

    // console.log(req.query.status);

    let find = {
        deleted: false
    }
    if(req.query.status) {
        find.status = req.query.status;
    }

//  Phan tim kiem
    const objectSearch = searchHelper(req.query);
    if(objectSearch.regex) {
        find.title = objectSearch.regex;
    }

// Pagination
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    );
// End pagination

// Sort
    let sort = {}
    if(req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "desc";
    }
// End Sort
    
    const products = await Product.find(find)
        .sort(sort)  // asc (theo tang dan), desc (theo giam dan)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    // console.log(products);
    res.render("admin/pages/products/index", {
        pageTitle: "Danh sach san pham",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    // console.log(req.params);
    const status = req.params.status;
    const id = req.params.id;

    // console.log(status);
    // console.log(id);

    await Product.updateOne({ _id: id }, { status: status });

    req.flash("success", "Cập nhật trạng thái thành công!");

    // res.send(`${status} - ${id}`);
    // res.redirect("/admin/products"); // chuyen huong trang web redirect()
    res.redirect("back");
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    // console.log(req.body);
    // res.send("ok");

    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, { status: "active"});
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, { status: "inactive"});
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await Product.updateMany({ _id: { $in: ids } }, 
            { 
                deleted: true,
                deletedAt: new Date()
            });
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await Product.updateOne({ _id: id}, { position: position});
            }
            req.flash("success", `Đã cập nhật lại vị trí thành công ${ids.length} sản phẩm!`);
            break;
        default:
            break;
    }

    res.redirect("back");
};

// [DELETE] : /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    // await Product.deleteOne({ _id: id });   // Xoa thang item trong database
    await Product.updateOne({ _id: id}, { 
        deleted: true, 
        deletedAt: new Date() 
    });    // Xoa mem

    req.flash("success", `Đã xóa thành công sản phẩm!`);

    res.redirect("back");
};

// [GET] : /admin/products/create
module.exports.create = async (req, res) => {

    const category = await ProductCategory.find({ deleted: false });

    const newCategory = createTreeHelper.tree(category);

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",
        category: newCategory,
    });
};

// [POST] : /admin/products/create
module.exports.createPost = async (req, res) => {
    // console.log(req.body);  // req.body: nhan du lieu tu form
    // console.log(req.file);

    // Luu vao trong database
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    
    if(req.body.position == "") {
        // const countProducts = await Product.count();
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    // console.log(req.body);
    // if(req.file) {
    //     req.body.thumbnail = `/uploads/${req.file.filename}`;
    // }

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] : /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    // console.log(req.params.id);
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);   //chi tim 1 ban ghi co trong database
        // console.log(product);

        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product
        });
    } catch(error) {
        req.flash()
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};

// [PATCH] : /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    // if(req.file) {
    //     req.body.thumbnail = `/uploads/${req.file.filename}`;
    // }

    try {
        await Product.updateOne({ _id: id }, req.body);
        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("success", "Cập nhật thất bại!");
    }

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET]: /admin/products/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        // console.log(product);

        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};