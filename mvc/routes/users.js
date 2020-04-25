const express = require("express");
const router = express.Router();
const middleware = require("./middleware/middleware");
const CtrlUser = require("../controllers/user");

const fakeUsersCtrl = require("../controllers/fake-users");

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
router.post("/create-post", middleware.authorize, CtrlUser.createPost);
router.post(
  "/like-unlike/:ownerid/:postid",
  middleware.authorize,
  CtrlUser.likeUnlike
);
router.post(
  "/post-comment/:ownerid/:postid",
  middleware.authorize,
  CtrlUser.postCommentOnPost
);

// Only for development Mode
router.delete("/all", CtrlUser.deleteAllUsers);
router.get("/all", CtrlUser.getAllUsers);
router.post("/create-fake-users", fakeUsersCtrl.createFakeUsers);
module.exports = router;
