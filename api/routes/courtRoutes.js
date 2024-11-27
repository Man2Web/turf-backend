const express = require("express");
const router = express.Router();
const couponRoutes = require("../routes/coupon/couponRoutes");
const { addCourt, upload } = require("../models/court/addCourt");
const editCourt = require("../models/court/editCourt");
const fetchCourtsWithLocation = require("../controllers/court/fetchCourtsWithLocation");
const getLocations = require("../controllers/court/getLocations");
const courtAvailability = require("../controllers/court/courtAvailability");
const fetchCourtWithCourtId = require("../controllers/court/fetchCourtWithCourtId");
const fetchCourtImage = require("../controllers/court/images/fetchCourtImage");
const getCourtRating = require("../controllers/court/getCourtRating");
const fetchTopRatedCourts = require("../controllers/court/fetchTopRatedCourts");

router.post("/add", upload.array("files"), addCourt);

router.post("/edit/:adminId/:courtId", upload.array("files"), editCourt);

router.get("/fetch/:courtId", fetchCourtWithCourtId);

router.get("/fetch/all/:location", fetchCourtsWithLocation);

router.get("/fetch/rating/:location", fetchTopRatedCourts);

router.get("/rating/:courtId", getCourtRating);

router.get("/getLocations", getLocations);

router.get("/availability/:courtId/:date", courtAvailability);

router.use("/coupon", couponRoutes);

router.get("/uploads/:adminId/:courtId/:imageName", fetchCourtImage);

module.exports = router;
