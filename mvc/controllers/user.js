const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

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
      if (err.errmsg && err.errmsg.includes("duplicate key error")) {
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

const generateFeed = (req, res) => {
  res.status(200).json({ message: "Generating posts for a users feed." });
};

const getSearchResults = ({ query, payload }, res) => {
  if (!query.query) {
    return res.json({ err: "Missing a query" });
  }
  User.find(
    { name: { $regex: query.query, $options: "i" } },
    "name",
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

// Only for development Mode
const deleteAllUsers = (req, res) => {
  User.deleteMany({}, (err, info) => {
    if (err) {
      return res.send({ error: err });
    }
    return res.json({ message: "Deleted All Users", info: info });
  });
};

module.exports = {
  deleteAllUsers,
  registerUser,
  loginUser,
  generateFeed,
  getSearchResults,
};
