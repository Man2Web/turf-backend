const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const db = require("../../config/database");
const { v4: uuid } = require("uuid");
const convertAvailability = require("../../services/convertAvailability");
const getCourtByUid = require("../../controllers/court/getCourtIdByUid");

const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage: storage });

const editCourt = async (req, res) => {
  const { courtId } = req.params;

  let {
    courtName,
    venuePrice,
    courtIncludes,
    amenities,
    location,
    courtType,
    venueOverview,
    rulesOfVenue,
    courtAvailability,
    userId,
    phoneNumber,
    email,
  } = req.body;

  const getCourtId = await db.query(
    "SELECT * FROM courts WHERE court_id = $1 AND admin_id = $2",
    [courtId, userId]
  );

  const court_id = getCourtId.rows[0].id;
  // Parse JSON fields
  try {
    venuePrice = JSON.parse(venuePrice);
    courtIncludes = JSON.parse(courtIncludes);
    amenities = JSON.parse(amenities);
    location = JSON.parse(location);
    courtAvailability = JSON.parse(courtAvailability);
    rulesOfVenue = JSON.parse(rulesOfVenue);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Invalid JSON format in one of the fields" });
  }

  const availabilityData = convertAvailability(courtAvailability);
  const courtImages = req.files;
  const uploadedImages = [];
  const uniqueId = uuid();
  const uploadDir = path.join(__dirname, `../../uploads/${userId}/${uniqueId}`);

  // Acquire a client from the pool
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN"); // Start a transaction

    // Remove the existing upload directory if it exists
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // Create the upload directory before processing images
    fs.mkdirSync(uploadDir, { recursive: true });

    // Uploading images to server
    if (courtImages && courtImages.length > 0) {
      for (const image of courtImages) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = `${uniqueSuffix}.webp`; // Create a unique filename with WebP format

        // Compress and convert the image to WebP format
        await sharp(image.buffer)
          .resize(800, 600) // Resize to 800x600 pixels
          .webp({ quality: 80 }) // Convert to WebP format with 80% quality
          .toFile(path.join(uploadDir, fileName));

        const imageUrl = `${fileName}`; // Store the relative path to the image
        uploadedImages.push(imageUrl);
      }
    }
    console.log(uploadedImages);
    const courtQuery = `
      UPDATE courts 
      SET court_name = $1, court_type = $2 
      WHERE id = $3
    `;
    await client.query(courtQuery, [courtName, courtType, court_id]);

    // Update court_details
    const courtDetailsQuery = `
      UPDATE court_details 
      SET availability = $1, images = $2, city = $3, location_link = $4, 
          embedded_link = $5, price = $6, add_price = $7, guests = $8, 
          add_guests = $9, advance_pay = $10, amenities = $11, 
          includes = $12, email = $13, phone_number = $14, 
          overview = $15, rules = $16 
      WHERE court_id = $17
    `;
    await client.query(courtDetailsQuery, [
      availabilityData,
      uploadedImages,
      location.city,
      location.locationLink,
      location.embedLink,
      venuePrice.startingPrice,
      venuePrice.priceOfAdditionalGuests,
      venuePrice.maxGuests,
      venuePrice.additionalGuests,
      venuePrice.advancePay,
      amenities,
      courtIncludes,
      email,
      phoneNumber,
      venueOverview,
      rulesOfVenue,
      court_id,
    ]);

    // Commit the transaction
    await client.query("COMMIT");
    res.status(200).json({ message: "Court updated successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    // Remove uploaded directory if exists
    fs.rm(uploadDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error while removing directory ${uploadDir}:`, err);
      }
    });
    console.error(error);
    res.status(500).json({ error: "Failed to update court" });
  } finally {
    client.release();
  }
};

module.exports = editCourt;
