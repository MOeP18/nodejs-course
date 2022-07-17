const bcrypt = require("bcryptjs");
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
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user || password !== user.password) {
        req.flash("errorLogin", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
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

exports.getProfile = (req, res, next) => {
  const userData = req.session.user;
  res.render("auth/profile", {
    path: "/profile",
    pageTitle: "Profile",
    userData: userData,
  });
};

exports.postProfile = (req, res, next) => {
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  if (newPassword !== confirmPassword) {
    return res.redirect("/profile");
  }
  const userData = req.session.user;
  console.log("userData: ", userData);
  User.findByIdAndUpdate(userData._id)
    .then(async (u) => {
      console.log(u);
      const hashedPsw = await bcrypt.hash(newPassword, 12);
      u.password = hashedPsw;
      const user = new User(u);
      user.save();
      console.log(u);
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("err:", err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "errorLogin",
          "Email exists already, please use different one."
        );
        return res.redirect("/signup");
      }
      console.log(userDoc);
      return bcrypt.hash(password, 12).then((hasshedPsw) => {
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
    })
    .catch((err) => {
      console.log(err);
    });
};
