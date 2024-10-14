const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const db = require("../../config/database");

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
    venueOverview, // Corrected field name
    rulesOfVenue,
    courtAvailability,
    userId,
    phoneNumber,
    email,
  } = req.body;

  console.log(req.body);

  // Parse JSON fields
  venuePrice = JSON.parse(venuePrice);
  courtIncludes = JSON.parse(courtIncludes);
  amenities = JSON.parse(amenities);
  location = JSON.parse(location);
  courtAvailability = JSON.parse(courtAvailability);

  const courtImages = req.files;

  // console.log(courtImages);

  // Acquire a client from the pool
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN"); // Start a transaction

    // 1. Insert into courts
    const courtQuery = `
      INSERT INTO courts (user_id, court_name, court_type, venue_overview, rules_of_venue, phone_number, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const courtValues = [
      userId,
      courtName,
      courtType,
      venueOverview,
      rulesOfVenue,
      phoneNumber,
      email,
    ];
    const courtResult = await client.query(courtQuery, courtValues);
    const courtId = courtResult.rows[0].id;

    // 2. Insert into locations
    const locationQuery = `
      INSERT INTO locations (country, city, location_link, embed_link, court_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const locationValues = [
      location.country,
      location.city,
      location.locationLink,
      location.embedLink,
      courtId,
    ];

    await client.query(locationQuery, locationValues);

    // Create the upload directory if it doesn't exist
    const uploadDir = path.join(
      __dirname,
      `../../uploads/${userId}/${courtId}`
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3. Insert into venue_price
    const venuePriceQuery = `
      INSERT INTO venue_price (court_id, starting_price, max_guests, additional_guests, price_of_additional_guests, advance_pay)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const venuePriceValues = [
      courtId,
      venuePrice.startingPrice,
      venuePrice.maxGuests,
      venuePrice.additionalGuests,
      venuePrice.priceOfAdditionalGuests,
      venuePrice.advancePay,
    ];
    await client.query(venuePriceQuery, venuePriceValues);

    // 4. Insert into court_includes
    const courtIncludesQuery = `
      INSERT INTO court_includes (court_id, badminton_racket, bats, hitting_machines, multiple_courts, spare_players, instant_racket, green_turfs)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    const courtIncludesValues = [
      courtId,
      courtIncludes.badmintonRacket,
      courtIncludes.bats,
      courtIncludes.hittingMachines,
      courtIncludes.multipleCourts,
      courtIncludes.sparePlayers,
      courtIncludes.instantRacket,
      courtIncludes.greenTurfs,
    ];
    await client.query(courtIncludesQuery, courtIncludesValues);

    // 5. Insert into amenities
    const amenitiesQuery = `
      INSERT INTO amenities (court_id, parking, drinking_water, first_aid, change_room, shower)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const amenitiesValues = [
      courtId,
      amenities.parking,
      amenities.drinkingWater,
      amenities.firstAid,
      amenities.changeRoom,
      amenities.shower,
    ];
    await client.query(amenitiesQuery, amenitiesValues);

    const courtImagesQuery = `
      INSERT INTO court_images (court_id, image_url)
      VALUES ($1, $2);
    `;

    for (const image of courtImages) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}.webp`; // Create a unique filename with WebP format

      // Compress and convert the image to WebP format
      await sharp(image.buffer)
        .resize(800, 600) // Resize to 800x600 pixels (you can adjust this)
        .webp({ quality: 80 }) // Convert to WebP format with 80% quality
        .toFile(path.join(uploadDir, fileName));

      const imageUrl = `${fileName}`; // Store the relative path to the image
      await client.query(courtImagesQuery, [courtId, imageUrl]); // Insert image URL into the database
    }
    // 7. Insert court availability for each day
    const availabilityQuery = `
      INSERT INTO court_availability (court_id, day_of_week, duration, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5);
    `;
    const availabilityDays = Object.keys(courtAvailability);
    for (const day of availabilityDays) {
      const availability = courtAvailability[day];
      await client.query(availabilityQuery, [
        courtId,
        day,
        availability.duration,
        availability.startTime,
        availability.endTime,
      ]);
    }

    // Commit the transaction
    await client.query("COMMIT");
    res.status(201).json({ message: "Court added successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to add court" });
  } finally {
    client.release();
  }
};

// Export the route handler and multer middleware
module.exports = { addCourt, upload };
