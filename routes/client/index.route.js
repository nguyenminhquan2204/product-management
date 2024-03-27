const categoryMiddleware = require("../../middlewares/client/category-middleware.js");

const homeRoutes = require("./home.route.js");
const productRoutes = require("./product.route.js");

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use("/", homeRoutes);

    app.use("/products", categoryMiddleware.category, productRoutes);

    
}