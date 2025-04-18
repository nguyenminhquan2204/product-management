const Product = require("../../models/product.model.js");
const ProductCategory = require("../../models/product-category.model.js");

const productsHelper = require("../../helpers/products");
const productsCategoryHelper = require("../../helpers/products-category");
const paginationHelper = require("../../helpers/pagination");
// [GET] /products
module.exports.index = async (req, res) => {
    const productsFeatured = await Product.find({
        status: "active",
        deleted: "false"
    }).sort({ position: "desc" });
    // console.log(products);

    // products.forEach(item => {
    //     item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0);
    // });

    const newProducts = productsHelper.priceNewProducts(productsFeatured);

    // console.log(newProducts);

    res.render("client/pages/products/index", {
       pageTitle: "Danh sách sản phẩm", 
       products: newProducts
    });
};

// [GET] /products/slugCategory
module.exports.category = async (req, res) => {
    // console.log(req.params.slugCategory);
    const category = await ProductCategory.findOne({
        slug: req.params.slugCategory,
        status: "active",
        deleted: false
    });


    const listSubCategory = await productsCategoryHelper.getSubCategory(category.id);
    
    const listSubCategoryId = listSubCategory.map(item => item.id);

    const countProducts = await Product.countDocuments({
        product_category_id: { $in: [category.id, ...listSubCategoryId]},
        deleted: false,
    });

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    );

    const products = await Product.find({
        product_category_id: { $in: [category.id, ...listSubCategoryId]},
        deleted: false,
    }).sort({ position: "desc" }).limit(objectPagination.limitItems).skip(objectPagination.skip);

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index", {
        pageTitle: category.title,
        products: newProducts,
        pagination: objectPagination
    });
};

// [GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slugProduct,
            status: "active"
        };

        const product = await Product.findOne(find);

        if(product.product_category_id) {
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                status: "active",
                deleted: false,
            });

            product.category = category;
        }

        product.priceNew = productsHelper.priceNewProduct(product);

        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });

    } catch (error) {
        res.redirect(`/products`);
    }
};