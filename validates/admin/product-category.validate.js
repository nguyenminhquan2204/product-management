module.exports.createPost = (req, res, next) => {
    if(!req.body.title) {
        req.flash("error", "Vui lòng nhập tiêu để!");
        res.redirect("back");
        return;
    }

    // console.log("OK");
    next(); // chuyen sang buoc ke tiep
};