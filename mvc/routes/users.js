const express = require("express");
const router = express.Router();
const middleware = require("./middleware/middleware");
const CtrlUser = require("../controllers/user");

router.post("/register", CtrlUser.registerUser);
router.post("/login", CtrlUser.loginUser);
router.get("/generate-feed", middleware.authorize, CtrlUser.generateFeed);
router.get(
  "/get-search-results",
  middleware.authorize,
  CtrlUser.getSearchResults
);

router.post(
  "/make-friend-request/:from/:to",
  middleware.authorize,
  CtrlUser.makeFriendRequest
);

router.get(
  "/get-friend-requests",
  middleware.authorize,
  CtrlUser.getFriendRequests
);

router.get(
  "/get-user-data/:userid",
  middleware.authorize,
  CtrlUser.getUserData
);
router.post(
  "/resolve-friend-request/:from/:to",
  middleware.authorize,
  CtrlUser.resolveFriendRequest
);

router.delete("/all", CtrlUser.deleteAllUsers);

module.exports = router;
