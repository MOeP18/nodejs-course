const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.post("/cart-increase-item", isAuth, shopController.postCart);

router.post("/cart-decrease-item", isAuth, shopController.postCartRemoveOne);

router.post("/create-order", isAuth, shopController.postOrder);

router.post("/delete-order", isAuth, shopController.postDeleteOrder);

router.get("/orders", isAuth, shopController.getOrders);

module.exports = router;
