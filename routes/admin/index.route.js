const systemConfig = require("../../config/system.js");

const authMiddleware = require("../../middlewares/admin/auth.middleware.js");

const dashboardRoutes = require("./dashboard.route");
const productCategoryRoutes = require("./product-category.route");
const productRouters = require("./product.route");
const roleRouters = require("./role.route");
const accountRouters = require("./account.route");
const authRouters = require("./auth.route");
const myAccountRouters = require("./my-account.route");

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(
        PATH_ADMIN + "/dashboard", 
        authMiddleware.requireAuth, 
        dashboardRoutes
    );

    app.use(
        PATH_ADMIN + "/products-category", 
        authMiddleware.requireAuth, 
        productCategoryRoutes
    );

    app.use(
        PATH_ADMIN + "/products", 
        authMiddleware.requireAuth, 
        productRouters
    );

    app.use(
        PATH_ADMIN + "/roles", 
        authMiddleware.requireAuth, 
        roleRouters
    );

    app.use(
        PATH_ADMIN + "/accounts", 
        authMiddleware.requireAuth, 
        accountRouters
    );

    app.use(PATH_ADMIN + "/auth", authRouters);

    app.use(
        PATH_ADMIN + "/my-account", 
        authMiddleware.requireAuth, 
        myAccountRouters
    );
}