const systemConfig = require("../../config/system.js");

const dashboardRoutes = require("./dashboard.route");
const productCategoryRoutes = require("./product-category.route");
const productRouters = require("./product.route");
const roleRouters = require("./role.route");
const accountRouters = require("./account.route");


module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(PATH_ADMIN + "/dashboard", dashboardRoutes);

    app.use(PATH_ADMIN + "/products-category", productCategoryRoutes);

    app.use(PATH_ADMIN + "/products", productRouters);

    app.use(PATH_ADMIN + "/roles", roleRouters);

    app.use(PATH_ADMIN + "/accounts", accountRouters);
}