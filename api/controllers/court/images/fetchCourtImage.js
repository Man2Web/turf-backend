const path = require("path");
const fs = require("fs");

const fetchCourtImage = (req, res) => {
  const { adminId, courtId, imageName } = req.params;

  // Define the path to the image based on courtId and imageName
  const imagePath = path.join(
    __dirname,
    "../../../",
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
};

module.exports = fetchCourtImage;
