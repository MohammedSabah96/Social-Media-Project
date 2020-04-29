const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Message = mongoose.model("Message");
const Comment = mongoose.model("Comment");
const timeAgo = require("time-ago");

const containsDuplicate = (array) => {
  array.sort();
  for (let i = 0; i < array.length; i++) {
    if (array[i] == array[i + 1]) {
      return true;
    }
  }
};

const addCommentDetails = (posts) => {
  return new Promise((resolve, reject) => {
    let promises = [];

    for (const post of posts) {
      for (const comment of post.comments) {
        let promise = new Promise((resolve, reject) => {
          User.findById(
            comment.commenter_id,
            "name profile_image",
            (err, user) => {
              comment.commenter_name = user.name;
              comment.commenter_profile = user.profile_image;
              resolve(comment);
            }
          );
        });
        promises.push(promise);
      }
    }
    Promise.all(promises).then((val) => {
      resolve(posts);
    });
  });
};

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const addToPosts = (array, user) => {
  for (const item of array) {
    item.name = user.name;
    item.ago = timeAgo.ago(item.date);
    item.ownerProfileImage = user.profile_image;
    item.ownerid = user._id;
  }
};

const registerUser = ({ body }, res) => {
  if (
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.password ||
    !body.password_confirm
  ) {
    return res.send({ message: "All Fields are required." });
  }

  if (body.password !== body.password_confirm) {
    return res.send({ message: "Passwords don't match." });
  }

  const user = new User();
  user.name = body.first_name.trim() + " " + body.last_name.trim();
  user.email = body.email;
  user.setPassword(body.password);
  user.save((err, newUser) => {
    if (err) {
      if (
        err.errmsg &&
        err.errmsg.includes("duplicate key error") &&
        err.errmsg.includes("email")
      ) {
        return res.json({
          message: "The provided email is already registered.",
        });
      }
      return res.json({
        message: "Something went wrong.",
      });
    } else {
      const token = newUser.getJwt();
      res.status(201).json({ token });
    }
  });
};

const loginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(404).json(err);
    }
    if (user) {
      const token = user.getJwt();
      return res.status(201).json({ token });
    } else {
      return res.json(info);
    }
  })(req, res);
};

const generateFeed = ({ payload }, res) => {
  const posts = [];
  const bestiePosts = [];

  let myPosts = new Promise((resolve, reject) => {
    User.findById(payload._id, "", { lean: true }, (err, user) => {
      if (err) {
        return res.json({ err: err });
      }
      addToPosts(user.posts, user);
      posts.push(...user.posts);

      user.friends = user.friends.filter((val) => {
        return !user.besties.includes(val);
      });

      resolve(user);
    });
  });

  function getPostsFrom(arrayOfUsers, maxAmountOfPosts, postsArray) {
    return new Promise((resolve, reject) => {
      User.find(
        { _id: { $in: arrayOfUsers } },
        "name posts profile_image",
        { lean: true },
        (err, users) => {
          if (err) {
            reject(err);
            return res.json({ err: err });
          }

          for (user of users) {
            addToPosts(user.posts, user);
            postsArray.push(...user.posts);
          }
          postsArray.sort((a, b) => (a.date > b.date ? -1 : 1));
          postsArray.splice(maxAmountOfPosts);

          addCommentDetails(postsArray).then(() => {
            resolve();
          });
        }
      );
    });
  }

  let myBestiesPosts = myPosts.then(({ besties }) => {
    return getPostsFrom(besties, 4, bestiePosts);
  });

  let myFriendsPosts = myPosts.then(({ friends }) => {
    return getPostsFrom(friends, 48, posts);
  });

  Promise.all([myBestiesPosts, myFriendsPosts]).then(() => {
    res.statusJson(200, { posts, bestiePosts });
  });
};

const getSearchResults = ({ query, payload }, res) => {
  if (!query.query) {
    return res.json({ err: "Missing a query" });
  }
  User.find(
    { name: { $regex: query.query, $options: "i" } },
    "name profile_image friends friend_requests",
    (err, results) => {
      if (err) {
        return res.json({ error: err });
      }

      results = results.slice(0, 20);
      for (let i = 0; i < results.length; i++) {
        if (results[i]._id == payload._id) {
          results.splice(i, 1);
          break;
        }
      }

      return res
        .status(200)
        .json({ message: "Getting Search Results", results: results });
    }
  );
};

const makeFriendRequest = ({ params }, res) => {
  User.findById(params.to, (err, user) => {
    if (err) {
      return res.json({ error: err });
    }

    if (containsDuplicate([params.from, ...user.friend_requests])) {
      return res.json({ message: "Friend request is already sent." });
    }
    user.friend_requests.push(params.from);
    user.save((err, user) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.statusJson(201, {
        message: "Successfully sent a friend request.",
      });
    });
  });
};

// when we put "-salt -password" mean that get everything except these two
const getUserData = ({ params }, res) => {
  User.findById(
    params.userid,
    "-salt -password",
    { lean: true },
    (err, user) => {
      if (err) {
        return res.json({ error: err });
      }

      function getRandomFriends(friendsList) {
        let copyOfFriendsList = Array.from(friendsList);
        let randomIds = [];
        for (let i = 0; i < 6; i++) {
          if (friendsList.length <= 6) {
            randomIds = copyOfFriendsList;
            break;
          }
          let randomId = getRandom(0, copyOfFriendsList.length);
          randomIds.push(copyOfFriendsList[randomId]);
          copyOfFriendsList.splice(randomId, 1);
        }

        return new Promise((resolve, reject) => {
          User.find(
            { _id: { $in: randomIds } },
            " name profile_image",
            (err, friends) => {
              if (err) {
                return res.json({ error: err });
              }
              resolve(friends);
            }
          );
        });
      }

      function addMessengerDetails(messages) {
        return new Promise((resolve, reject) => {
          if (!messages.length) {
            resolve(messages);
          }
          let usersArray = [];
          for (const message of messages) {
            usersArray.push(message.from_id);
          }

          User.find(
            { _id: { $in: usersArray } },
            "name profile_image",
            (err, users) => {
              if (err) {
                return res.json({ error: err });
              }
              for (message of messages) {
                for (let i = 0; i < users.length; i++) {
                  if (message.from_id == users[i]._id) {
                    message.messengerName = users[i].name;
                    message.messengerProfileImage = users[i].profile_image;
                    users.splice(i, 1);
                    break;
                  }
                }
              }
              resolve(messages);
            }
          );
        });
      }

      user.posts.sort((a, b) => (a.date > b.date ? -1 : 1));
      addToPosts(user.posts, user);
      let randomFriends = getRandomFriends(user.friends);
      let commentDetails = addCommentDetails(user.posts);
      let messageDetails = addMessengerDetails(user.messages);

      let besties = new Promise((resolve, reject) => {
        User.find(
          { _id: { $in: user.besties } },
          "name profile_image",
          (err, users) => {
            if (err) {
              return res.json({ error: err });
            }
            user.besties = users;
            resolve();
          }
        );
      });
      let enemies = new Promise((resolve, reject) => {
        User.find(
          { _id: { $in: user.enemies } },
          "name profile_image",
          (err, users) => {
            if (err) {
              return res.json({ error: err });
            }
            user.enemies = users;
            resolve();
          }
        );
      });

      const waitFor = [
        randomFriends,
        commentDetails,
        messageDetails,
        besties,
        enemies,
      ];

      Promise.all(waitFor).then((val) => {
        user.random_friends = val[0];
        user.messages = val[2];
        res.statusJson(200, { user: user });
      });
    }
  );
};

const getFriendRequests = ({ query }, res) => {
  let friendRequests = JSON.parse(query.friend_requests);

  User.find(
    { _id: { $in: friendRequests } },
    "name profile_image",
    (err, users) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.statusJson(200, {
        message: "Getting friend requests",
        users: users,
      });
    }
  );
};

const resolveFriendRequest = ({ params, query }, res) => {
  User.findById(params.to, (err, user) => {
    if (err) {
      return res.json({ error: err });
    }
    for (let i = 0; i < user.friend_requests.length; i++) {
      if (user.friend_requests[i] == params.from) {
        user.friend_requests.splice(i, 1);
        break;
      }
    }

    let promise = new Promise((resolve, reject) => {
      if (query.resolution == "accept") {
        if (containsDuplicate([params.from, ...user.friends])) {
          return res.json({ message: "Duplicate Error." });
        }
        user.friends.push(params.from);

        User.findById(params.from, (err, user) => {
          if (err) {
            return res.json({ error: err });
          }
          if (containsDuplicate([params.to, ...user.friends])) {
            return res.json({ message: "Duplicate Error." });
          }
          user.friends.push(params.to);
          user.save((err, user) => {
            if (err) {
              return res.json({ error: err });
            }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });

    promise.then(() => {
      user.save((err, user) => {
        if (err) {
          return res.json({ error: err });
        }

        res.statusJson(201, { message: "Resolved friend request" });
      });
    });
  });
};

const createPost = ({ body, payload }, res) => {
  if (!body.content || !body.theme) {
    return res.statusJson(400, {
      message: "Insufficient data sent with the request.",
    });
  }
  let userId = payload._id;

  const post = new Post();

  post.theme = body.theme;
  post.content = body.content;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.json({ error: err });
    }

    let newPost = post.toObject();
    newPost.name = payload.name;
    newPost.ownerid = payload._id;
    newPost.ownerProfileImage = user.profile_image;

    user.posts.push(post);
    user.save((err) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.statusJson(201, { message: "Create Post", newPost: newPost });
    });
  });
};

const likeUnlike = ({ params, payload }, res) => {
  User.findById(params.ownerid, (err, user) => {
    if (err) {
      return res.json({ error: err });
    }

    const post = user.posts.id(params.postid);

    if (post.likes.includes(payload._id)) {
      post.likes.splice(post.likes.indexOf(payload._id), 1);
    } else {
      post.likes.push(payload._id);
    }
    user.save((err, user) => {
      if (err) {
        return res.json({ error: err });
      }
      res.statusJson(201, { message: "Like or Unlike a post....", user: user });
    });
  });
};

const postCommentOnPost = ({ body, params, payload }, res) => {
  User.findById(params.ownerid, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    const post = user.posts.id(params.postid);
    let comment = new Comment();
    comment.commenter_id = payload._id;
    comment.comment_content = body.content;
    post.comments.push(comment);
    user.save((err, user) => {
      if (err) {
        return res.json({ err: err });
      }

      User.findById(payload._id, "name profile_image ", (err, user) => {
        if (err) {
          return res.json({ err: err });
        }
        res.statusJson(201, {
          message: "POST COMMENT",
          comment: comment,
          commenter: user,
        });
      });
    });
  });
};

const sendMessage = ({ body, params, payload }, res) => {
  let from = payload._id;
  let to = params.to;

  let fromPromise = new Promise((resolve, reject) => {
    User.findById(from, "messages", (err, user) => {
      if (err) {
        reject(err);
        return res.json({ err: err });
      }
      from = user;
      resolve(user);
    });
  });

  let toPromise = new Promise((resolve, reject) => {
    User.findById(to, "messages new_message_notifications", (err, user) => {
      if (err) {
        reject(err);
        return res.json({ err: err });
      }
      to = user;
      resolve(user);
    });
  });

  let sendMessagePromise = Promise.all([fromPromise, toPromise]).then(() => {
    function hasMessageFrom(messages, id) {
      for (let message of messages) {
        if (message.from_id == id) {
          return message;
        }
      }
    }

    function sendMessageTo(to, from, notify = false) {
      return new Promise((resolve, reject) => {
        if (notify && !to.new_message_notifications.includes(from._id)) {
          to.new_message_notifications.push(from._id);
        }

        if ((foundMessage = hasMessageFrom(to.messages, from._id))) {
          foundMessage.content.push(message);
          to.save((err, user) => {
            if (err) {
              reject(err);
              return res.json({ err: err });
            }
            resolve(user);
          });
        } else {
          let newMessage = new Message();
          newMessage.from_id = from._id;
          newMessage.content = [message];

          to.messages.push(newMessage);
          to.save((err, user) => {
            if (err) {
              reject(err);
              return res.json({ err: err });
            }
            resolve(user);
          });
        }
      });
    }

    let message = {
      messenger: from._id,
      message: body.content,
    };

    let sendMessageToRecipient = sendMessageTo(to, from, true);
    let sendMessageToAuthor = sendMessageTo(from, to);

    return new Promise((resolve, reject) => {
      Promise.all([sendMessageToRecipient, sendMessageToAuthor]).then(() => {
        resolve();
      });
    });
  });

  sendMessagePromise.then(() => {
    return res.statusJson(201, { message: "Sending Message" });
  });
};

const resetMessageNotifications = ({ payload }, res) => {
  User.findById(payload._id, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    user.new_message_notifications = [];
    user.save((err) => {
      if (err) {
        return res.json({ err: err });
      }
      return res.statusJson(201, { message: "Reset message notifications" });
    });
  });
};

const deleteMessage = ({ params, payload }, res) => {
  User.findById(payload._id, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    const message = user.messages.id(params.messageid).remove();

    user.save((err) => {
      if (err) {
        return res.json({ err: err });
      }
      return res.statusJson(201, { message: "Deleted Message" });
    });
  });
};

const bestieEnemyToggle = ({ params, payload, query }, res) => {
  let toggle = query.toggle;
  if (toggle != "besties" && toggle != "enemies") {
    return res.json({ message: "Incorrect query supplied." });
  }

  let myId = payload._id;
  let friendId = params.userid;

  User.findById(myId, (err, user) => {
    if (err) {
      return res.json({ err: err });
    }
    if (!user.friends.includes(friendId)) {
      return res.json({ message: "You are not friends with this user." });
    }

    let arr = user[toggle];

    if (arr.includes(friendId)) {
      arr.splice(arr.indexOf(friendId), 1);
    } else {
      if (toggle == "besties" && user.besties.length >= 2) {
        return res.json({ message: "You have the max amount of besties." });
      }
      arr.push(friendId);
    }
    user.save((err) => {
      if (err) {
        return res.json({ err: err });
      }
      return res.statusJson(201, { message: "Bestie/Enemy" });
    });
  });
};

// Only for development Mode
const deleteAllUsers = (req, res) => {
  User.deleteMany({}, (err, info) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ message: "Deleted All Users", info: info });
  });
};
// Only for development Mode
const getAllUsers = (req, res) => {
  User.find((err, users) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ message: "Get All Users", users: users });
  });
};

module.exports = {
  deleteAllUsers,
  getAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
  makeFriendRequest,
  getUserData,
  getFriendRequests,
  resolveFriendRequest,
  createPost,
  likeUnlike,
  postCommentOnPost,
  sendMessage,
  resetMessageNotifications,
  deleteMessage,
  bestieEnemyToggle,
};
