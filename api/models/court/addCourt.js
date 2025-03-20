const AWS = require("aws-sdk");
const multer = require("multer");
const db = require("../../config/database");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
const convertAvailability = require("../../services/convertAvailability");

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 storage configuration
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory temporarily
});

// Function to upload image to S3
const uploadImageToS3 = async (buffer, key) => {
  const optimizedBuffer = await sharp(buffer).webp().toBuffer();

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: optimizedBuffer,
    ContentType: "image/webp",
    // ACL: "public-read", // Make the file publicly accessible
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // Return the file URL
};

// Updated addCourt function
const addCourt = async (req, res) => {
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

  let rulesOfTheVenue;
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

  const client = await db.pool.connect();
  const uniqueId = uuid();

  try {
    await client.query("BEGIN");

    const courtQuery = `
      INSERT INTO courts (admin_id, court_name, court_type, court_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const courtValues = [userId, courtName, courtType, uniqueId];
    const courtResult = await client.query(courtQuery, courtValues);
    const courtId = courtResult.rows[0].id;

    // Upload images to S3
    for (const image of courtImages) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `uploads/${userId}/${uniqueId}/${uniqueSuffix}.webp`; // S3 key
      const imageUrl = await uploadImageToS3(image.buffer, fileName);
      uploadedImages.push(imageUrl);
    }
    console.log(uploadedImages);
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

    await client.query("COMMIT");
    res.status(201).json({ message: "Court Request Successfully sent!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to add court" });
  } finally {
    client.release();
  }
};

module.exports = { addCourt, upload };
