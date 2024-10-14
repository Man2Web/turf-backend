const express = require("express");
const auth = require("../controllers/super-admin/auth");
const checkCourtsData = require("../controllers/super-admin/checkCourtsData");
const fetchCourtWithCourtId = require("../controllers/super-admin/fetchCourtWithCourtId");
const approveCourtWithId = require("../controllers/super-admin/approveCourtWithId");
const router = express.Router();

router.post("/auth", auth);

router.get("/courts", checkCourtsData);

router.get("/fetch/:courtId", fetchCourtWithCourtId);

router.put("/court/approve/:courtId", approveCourtWithId);

router.delete("/court/:courtId", approveCourtWithId);

module.exports = router;
