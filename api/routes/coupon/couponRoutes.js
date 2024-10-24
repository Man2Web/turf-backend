const express = require("express");
const addCoupon = require("../../controllers/court/coupons/addCoupon");
const getCoupons = require("../../controllers/court/coupons/getCoupons");
const removeCoupon = require("../../controllers/court/coupons/removeCoupon");
const getCourtCoupons = require("../../controllers/court/coupons/getCourtCoupons");
const router = express();

router.get("/:adminId", getCoupons);

router.get("/get/:courtId", getCourtCoupons);

router.post("/add", addCoupon);

router.delete("/remove/:adminId/:couponId", removeCoupon);

module.exports = router;
