const express = require("express");
const { check, body } = require("express-validator/check");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/profile", authController.getProfile);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a vaild email.")
      .normalizeEmail(),
    body("password", "Password have to be valid.").isLength({ min: 3 }).trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a vaild email.")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Email exists already, please use different one."
            );
          }
        });
      }),
    body("password", "Please enter password with at least 5 characters.")
      .trim()
      .isLength({ min: 5 }),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match.");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/profile-change-password", authController.postProfile);

module.exports = router;
