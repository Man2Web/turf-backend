const express = require("express");
const fetchBookingDataWithId = require("../controllers/bookings/fetchBookingDataWithId");
const router = express();

router.get("/get/:t_id", fetchBookingDataWithId);

module.exports = router;
