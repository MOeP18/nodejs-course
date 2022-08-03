module.exports = (req, res, next) => {
  if (req.session.user._id.toString() !== process.env.ADMIN_ID) {
    return res.redirect("/");
  }
  next();
};
