const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-item", shopController.postCartDeleteProduct);

router.post("/cart-increase-item", shopController.postCart);

router.post("/cart-decrease-item", shopController.postCartRemoveOne);

router.post("/create-order", shopController.postOrder);

router.post("/delete-order", shopController.postDeleteOrder);

router.get("/orders", shopController.getOrders);

module.exports = router;
