const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("errorLogin");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    prevInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("errorLogin");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    prevInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.getProfile = (req, res, next) => {
  let message = req.flash("errorPassword");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const userData = req.session.user;
  res.render("auth/profile", {
    path: "/profile",
    pageTitle: "Profile",
    userData: userData,
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      prevInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          prevInput: { email: email, password: password },
          validationErrors: [{ param: "email", param: "password" }],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              err && console.log("error:", err);
              res.redirect("/");
            });
          }
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postProfile = (req, res, next) => {
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  if (newPassword !== confirmPassword) {
    req.flash("errorPassword", "The two passwords do not match.");
    return res.redirect("/profile");
  }
  const userData = req.session.user;
  User.findByIdAndUpdate(userData._id)
    .then(async (u) => {
      const hashedPsw = await bcrypt.hash(newPassword, 12);
      u.password = hashedPsw;
      const user = new User(u);
      user.save();
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log("err:", err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      prevInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt.hash(password, 12).then((hasshedPsw) => {
    const user = new User({
      email: email,
      password: hasshedPsw,
      cart: { items: [] },
    });
    return user.save().then(() => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    });
  });
};
