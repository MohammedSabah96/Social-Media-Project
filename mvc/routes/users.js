const express = require("express");
const router = express.Router();
const CtrlUser = require("../controllers/user");

router.post("/register", CtrlUser.registerUser);

router.post("/login", CtrlUser.loginUser);

module.exports = router;
