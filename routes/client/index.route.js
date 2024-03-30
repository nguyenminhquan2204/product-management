const categoryMiddleware = require("../../middlewares/client/category-middleware.js");
const cartMiddleware = require("../../middlewares/client/cart.middleware.js");

const homeRoutes = require("./home.route.js");
const productRoutes = require("./product.route.js");
const searchRoutes = require("./search.route.js");
const cartRoutes = require("./cart.route.js");
const checkoutRoutes = require("./checkout.route.js");

module.exports = (app) => {
    app.use(categoryMiddleware.category);

    app.use(cartMiddleware.cartId);

    app.use("/", homeRoutes);

    app.use("/products", productRoutes);

    app.use("/search", searchRoutes);

    app.use("/cart", cartRoutes);

    app.use("/checkout", checkoutRoutes);

}