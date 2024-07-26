const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const controller = require("../../controllers/client/chat.controller");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const chatMiddleware = require("../../middlewares/client/chat.middleware");

router.get("/:roomChatId", chatMiddleware.isAccess, controller.index);

router.get("/editRoomTitle/:id", controller.editRoomTitle);

router.patch("/editRoomTitle/:id", 
    upload.single("avatar"),
    uploadCloud.upload,
    controller.editRoomTitlePatch
);

router.get("/member/:id", controller.member);

router.get("/deleteMember/:roomId", controller.deleteMember);

router.patch("/deleteMember/:roomId/:userId", controller.deleteMemberPatch);

router.get("/addMember/:id", controller.addMember)

router.patch("/addMember/:roomId/:userId", controller.addMemberPatch);

module.exports = router;