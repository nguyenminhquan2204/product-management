const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/admin/user.controller");
const validate = require("../../validates/admin/account.validate");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single("avatar"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id", 
    upload.single("avatar"),
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.delete("/delete/:id", controller.deleteItem);

module.exports = router;