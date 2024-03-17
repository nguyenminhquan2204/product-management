const Product = require("../../models/product.model.js");

// [GET] /products
module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: "active",
        deleted: "false"
    }).sort({ position: "desc" });
    // console.log(products);

    // products.forEach(item => {
    //     item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0);
    // });

    const newProducts = products.map(item => {
        item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0);
        return item;
    });

    // console.log(newProducts);

    res.render("client/pages/products/index", {
       pageTitle: "Danh sach san pham", 
       products: newProducts
    });
};

// [GET] /products/slug
module.exports.detail = async (req, res) => {
    // console.log(req.params.slug);

    try {
        const find = {
            deleted: false,
            slug: req.params.slug,
            status: "active"
        };

        const product = await Product.findOne(find);

        // console.log(product);

        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });

    } catch (error) {
        res.redirect(`/products`);
    }
};