const { addLogin, getLoginByUsername } = require("../services/p.auth.dal");
const bcrypt = require("bcrypt");
const uuid = require("uuid");

const getByUsername = async (req, res) => {
  try {
    if (DEBUG) console.log("auth.getLoginByUsername().try");
    let user = await getLoginByUsername(req.body.username);
    if (DEBUG) console.log(user);
    if (user === undefined) {
      req.app.locals.status = "Incorrect user name was entered.";
      res.redirect("/auth");
    }
    if (await bcrypt.compare(req.body.password, user.password)) {
      // change using app.locals to use session or java web token (jwt)
      req.app.locals.user = user;
      req.app.locals.status = "Happy for your return " + user.username;
      res.redirect("/");
    } else {
      req.app.locals.status = "Incorrect password was entered.";
      res.redirect("/auth");
    }
  } catch (error) {
    console.log(error);
    if (DEBUG) console.log("auth.getLoginByUsername().catch: " + user.username);
    res.render("503");
    // log this error to an error log file.
  }
};

const createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    if (req.body.email && req.body.username && req.body.password) {
      var result = await addLogin(
        req.body.username,
        req.body.email,
        hashedPassword,
        uuid.v4()
      );
      if (DEBUG) console.log("result: " + result);
      // duplicate username, comes from uniqueness constraint
      // in postgresql(err.code=23505) OR mongodb(err.code=11000)
      if (result === "23505") {
        if (DEBUG) console.log("Username already exists, please try another.");
        req.app.locals.status = "Username already exists, please try another.";
        res.redirect("/auth/new");
      } else {
        req.app.locals.status = "New account created, please login.";
        res.redirect("/auth");
      }
    } else {
      if (DEBUG) console.log("Not enough form fields completed.");
      req.app.locals.status = "Not enough form fields completed.";
      res.redirect("/auth/new");
    }
  } catch (error) {
    console.log(error);
    res.render("503");
    // log this error to an error log file.
  }
};

module.exports = { getByUsername, createUser };
