const express = require("express");
const { addUser } = require("../controllers/users/addUser");
const { getUser } = require("../controllers/users/getUser");
const updateUser = require("../controllers/users/updateUser");
const updatePass = require("../controllers/users/updatePass");
const { updateMid } = require("../controllers/users/updateMid");
const {
  fetchBookingsWithUserId,
} = require("../controllers/bookings/fetchBookingsUser");
const updateWishlist = require("../controllers/users/updateWishlist");
const getUserReview = require("../controllers/bookings/getUserReview");
const addUserReview = require("../controllers/bookings/addUserReview");
const updateUserReview = require("../controllers/bookings/updateUserReview");
const forgotPassword = require("../controllers/users/forgotPassword");
const checkResetToken = require("../controllers/users/checkResetToken");
const resetPassword = require("../controllers/users/resetPassword");
const router = express.Router();

router.post("/addUser", addUser);

router.post("/update/mid/:id", updateMid);

router.get("/booking/:userId", fetchBookingsWithUserId);

router.get("/review/:courtId/:T_Id", getUserReview);

router.post("/review/add/:courtId/:T_Id", addUserReview);

router.get("/forgot/:email", forgotPassword);

router.get("/token/:token", checkResetToken);

router.post("/password/reset", resetPassword);

router.put("/review/update/:courtId/:T_Id", updateUserReview);

router.get("/get/:id", getUser);

router.put("/update/:id", updateUser);

router.put("/pass/update/:id", updatePass);

router.put("/wishlist/update/:id", updateWishlist);

module.exports = router;
