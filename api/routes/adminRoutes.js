const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { getAdmins } = require("../controllers/adminController");
const { addAdmin } = require("../controllers/addAdmin");
const authAdmin = require("../controllers/authAdmin");
const { fetchCourt } = require("../controllers/fetchCourt");
const { fetchCourtWithId } = require("../controllers/fetchCourtWithId");
const {
  fetchBookingsWithAdminId,
} = require("../controllers/bookings/fetchBookingsWithAdminId");
const { deleteCourt } = require("../controllers/deleteCourt");

// This file is not found need to check later.
router.get("/admins", getAdmins);

router.post("/addAdmin", addAdmin);

router.post("/auth", authAdmin);

router.get("/booking/:adminId", fetchBookingsWithAdminId);

router.get("/court/fetch/:id", fetchCourt);

router.get("/court/fetch/:adminId/:courtId", fetchCourtWithId);

router.post("/court/delete/:adminId/:courtId", deleteCourt);

// Route to fetch image blob
router.get("/uploads/:adminId/:courtId/:imageName", (req, res) => {
  const { adminId, courtId, imageName } = req.params;

  // Define the path to the image based on courtId and imageName
  const imagePath = path.join(
    __dirname,
    "..",
    "uploads",
    adminId,
    courtId,
    imageName
  );

  // Verify if the image file exists and send it as a response
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error accessing image file:", err);
      return res.status(404).json({ message: "Image not found" });
    }

    // Read the image file from the file system
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error("Error reading image file:", err);
        return res.status(500).json({ message: "Error reading image file" });
      }

      // Determine the content type based on file extension
      const fileExt = path.extname(imageName).toLowerCase();
      let contentType = "image/jpeg"; // Default to jpeg
      if (fileExt === ".png") contentType = "image/png";
      else if (fileExt === ".webp") contentType = "image/webp";
      else if (fileExt === ".gif") contentType = "image/gif";

      // Set the appropriate content type and send the image
      res.setHeader("Content-Type", contentType);
      res.send(data);
    });
  });
});

// router.put("/court/:adminId/:courtId", editCourt);

module.exports = router;
