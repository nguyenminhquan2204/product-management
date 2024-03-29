const Product = require("../../models/product.model.js");
const ProductCategory = require("../../models/product-category.model.js");

const productsHelper = require("../../helpers/products");
const productsCategoryHelper = require("../../helpers/products-category");

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
       pageTitle: "Danh sach san pham", 
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

    try{

        const listSubCategory = await productsCategoryHelper.getSubCategory(category.id);
        
        const listSubCategoryId = listSubCategory.map(item => item.id);

        const products = await Product.find({
            product_category_id: { $in: [category.id, ...listSubCategoryId]},
            deleted: false,
        }).sort({ position: "desc" });

        const newProducts = productsHelper.priceNewProducts(products);

        res.render("client/pages/products/index", {
            pageTitle: category.title,
            products: products,
        });
    } catch(error) {
        res.redirect("back");
    }
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