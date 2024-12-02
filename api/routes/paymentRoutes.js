const express = require("express");
const router = express.Router();
const payment = require("../controllers/payment/payment");
const status = require("../controllers/payment/status");
const admin = require("../controllers/payment/admin");

router.post("/", payment);

router.post("/status", status);

router.post("/admin", admin);

module.exports = router;
