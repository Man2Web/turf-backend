const express = require("express");
const router = express.Router();
const getAdmins = require("../controllers/admins/adminController");
const addAdmin = require("../controllers/admins/addAdmin");
const authAdmin = require("../controllers/admins/authAdmin");
const fetchCourt = require("../controllers/court/fetchCourt");
const fetchCourtWithId = require("../controllers/court/fetchCourtWithId");
const fetchBookingsWithAdminId = require("../controllers/bookings/fetchBookingsWithAdminId");
const deleteCourt = require("../controllers/court/deleteCourt");
const fetchCourtImage = require("../controllers/court/images/fetchCourtImage");

// This file is not found need to check later.
router.get("/admins", getAdmins);

router.post("/addAdmin", addAdmin);

router.post("/auth", authAdmin);

router.get("/booking/:adminId", fetchBookingsWithAdminId);

router.get("/court/fetch/:id", fetchCourt);

router.get("/court/fetch/:adminId/:courtId", fetchCourtWithId);

router.post("/court/delete/:adminId/:courtId", deleteCourt);

router.get("/uploads/:adminId/:courtId/:imageName", fetchCourtImage);

// router.put("/court/:adminId/:courtId", editCourt);

module.exports = router;
