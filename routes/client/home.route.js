const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/home.controllers.js");

router.get("/", controller.index);

module.exports = router;