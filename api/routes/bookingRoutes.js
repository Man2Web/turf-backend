const express = require("express");
const fetchBookingDataWithId = require("../controllers/bookings/fetchBookingDataWithId");
const getBookingPdf = require("../controllers/bookings/getBookingPdf");
const router = express();

router.get("/get/:t_id", fetchBookingDataWithId);

router.get("/download/:t_id", getBookingPdf);

module.exports = router;
