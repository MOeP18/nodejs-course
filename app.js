const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://admin:G2pDSRKQBoZGC4p4@cluster0.ad1lo.mongodb.net/shop";

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
let adminUser = false;
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret value",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const csrfProtection = csrf();

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;

  if (req.user) {
    let cartItemsQuantity = 0;
    req.user.cart.items.map((item) => {
      cartItemsQuantity += item.quantity;
    }),
      (res.locals.cartItems = cartItemsQuantity);
  }
  (res.locals.adminUser = adminUser), (res.locals.csrfToken = req.csrfToken());

  if (!req.session.user) {
    return next();
  }
  if (req.session.user._id.toString() === "62ea0abeb9bc377f5d6376d0") {
    adminUser = true;
  }
  console.log(res.locals);
  next();
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
