const express = require("express");
const multer = require("multer");

// upload len cloud
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cloudinary
cloudinary.config({ 
    cloud_name: 'dfywnhjtq', 
    api_key: '186781583242864', 
    api_secret: 'CwrU2sH7coDGJ0L6jFjWbKRtXg8' 
  });
// End Cloudinary

const router = express.Router();

// const storageMulter = require("../../helpers/storageMulter");
// const upload = multer({ storage: storageMulter() });  // Cau hinh upload vao folder
const upload = multer();

const controller = require("../../controllers/admin/product.controllers.js");
const validate = require("../../validates/admin/product.validate.js");

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post(
    "/create",
    upload.single("thumbnail"),
    function (req, res, next) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
        }

        upload(req);
    },
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    validate.createPost,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;