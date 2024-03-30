const Cart = require("../../models/cart.model");

module.exports.cartId = async (req, res, next) => {
    // console.log(req.cookies.cartId);

    if(!req.cookies.cartId) {
        // Khi chưa có giỏ hàng
        const cart = new Cart();
        await cart.save();

        const expiresTime = 1000 * 60 * 60 * 24 * 365;   // Luu trong 1 nam

        res.cookie("cartId", cart.id, {
            expires: new Date(Date.now() + expiresTime)
        });   //Luu vao cookie

        // console.log(cart);
    } else {
        // Khi đã có giỏ hàng
    }

    next();
};