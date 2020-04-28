const express = require("express");
const router = express.Router();
const middleware = require("./middleware/middleware");
const CtrlUser = require("../controllers/user");

const fakeUsersCtrl = require("../controllers/fake-users");

// Loging In & Registering
router.post("/register", CtrlUser.registerUser);
router.post("/login", CtrlUser.loginUser);

// Get Requests
router.get("/generate-feed", middleware.authorize, CtrlUser.generateFeed);
router.get(
  "/get-search-results",
  middleware.authorize,
  CtrlUser.getSearchResults
);
router.get(
  "/get-user-data/:userid",
  middleware.authorize,
  CtrlUser.getUserData
);

// Routes Handling Friend Requests
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
router.post(
  "/resolve-friend-request/:from/:to",
  middleware.authorize,
  CtrlUser.resolveFriendRequest
);

// Routes Handling Posts
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

// Routes Handling Messages
router.post("/send-message/:to", middleware.authorize, CtrlUser.sendMessage);
router.post(
  "/reset-message-notifications",
  middleware.authorize,
  CtrlUser.resetMessageNotifications
);
router.post(
  "/delete-message/:messageid",
  middleware.authorize,
  CtrlUser.deleteMessage
);

// Misc Routes

router.post(
  "/bestie-enemy-toggle/:userid",
  middleware.authorize,
  CtrlUser.bestieEnemyToggle
);

// Only for development Mode
router.delete("/all", CtrlUser.deleteAllUsers);
router.get("/all", CtrlUser.getAllUsers);
router.post("/create-fake-users", fakeUsersCtrl.createFakeUsers);

module.exports = router;
