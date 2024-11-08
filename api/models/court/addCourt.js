const db = require("../../config/database");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const convertAvailability = require("../../services/convertAvailability");

// Configure multer to store files in memory as Buffer
const storage = multer.memoryStorage(); // Store files in memory temporarily

const upload = multer({ storage: storage });

const addCourt = async (req, res) => {
  // Extract form fields and files
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

  // console.log(req.body);
  let rulesOfTheVenue;
  // Parse JSON fields
  try {
    venuePrice = JSON.parse(venuePrice);
    courtIncludes = JSON.parse(courtIncludes);
    amenities = JSON.parse(amenities);
    location = JSON.parse(location);
    courtAvailability = JSON.parse(courtAvailability);
    rulesOfTheVenue = JSON.parse(rulesOfVenue);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Invalid JSON format in one of the fields" });
  }

  const availabilityData = convertAvailability(courtAvailability);
  const courtImages = req.files;
  const uploadedImages = [];

  // Acquire a client from the pool
  const client = await db.pool.connect();
  const uniqueId = uuid();
  const uploadDir = path.join(__dirname, `../../uploads/${userId}/${uniqueId}`);

  try {
    await client.query("BEGIN"); // Start a transaction

    // 1. Insert into courts
    const courtQuery = `
      INSERT INTO courts (admin_id, court_name, court_type, court_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const courtValues = [userId, courtName, courtType, uniqueId];
    const courtResult = await client.query(courtQuery, courtValues);
    const courtId = courtResult.rows[0].id;

    // Create the upload directory before processing images
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Uploading images to server
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

    // Insert court_details
    const courtDetailsQuery = `
      INSERT INTO court_details (
        court_id, availability, images, city, location_link, embedded_link, price, 
        add_price, guests, add_guests, 
        advance_pay, amenities, includes, 
        email, phone_number, overview, rules
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `;

    await client.query(courtDetailsQuery, [
      courtId,
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
      rulesOfTheVenue,
    ]);

    // Commit the transaction
    await client.query("COMMIT");
    res.status(201).json({ message: "Court Request Successfully sent!" });
  } catch (error) {
    await client.query("ROLLBACK");
    // Use fs.rm() with a callback to handle potential errors
    fs.rm(uploadDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error while removing directory ${uploadDir}:`, err);
      }
    });
    console.error(error);
    res.status(500).json({ error: "Failed to add court" });
  } finally {
    client.release();
  }
};

// Export the route handler and multer middleware
module.exports = { addCourt, upload };
