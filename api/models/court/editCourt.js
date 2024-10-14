const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const db = require("../../config/database");

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

  venuePrice = JSON.parse(venuePrice);
  courtIncludes = JSON.parse(courtIncludes);
  amenities = JSON.parse(amenities);
  location = JSON.parse(location);
  courtAvailability = JSON.parse(courtAvailability);

  const courtImages = req.files;

  //   console.log('Court Images:', courtImages);

  if (!courtImages || courtImages.length === 0) {
    return res.status(400).json({ error: "No files were uploaded." });
  }

  // Acquire a client from the pool
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN"); // Start a transaction

    // 1. Update courts
    const courtQuery = `
      UPDATE courts 
      SET court_name = $1, court_type = $2, venue_overview = $3, rules_of_venue = $4, phone_number = $5, email = $6
      WHERE id = $7 AND user_id = $8;
    `;
    const courtValues = [
      courtName,
      courtType,
      venueOverview,
      rulesOfVenue,
      phoneNumber,
      email,
      courtId,
      userId,
    ];
    await client.query(courtQuery, courtValues);

    // 2. Update locations
    if (location) {
      const locationQuery = `
        UPDATE locations 
        SET country = $1, city = $2, location_link = $3, embed_link = $4
        WHERE court_id = $5;
      `;
      const locationValues = [
        location.country,
        location.city,
        location.locationLink,
        location.embedLink,
        courtId,
      ];
      await client.query(locationQuery, locationValues);
    }

    // 3. Update venue_price
    if (venuePrice) {
      const venuePriceQuery = `
        UPDATE venue_price 
        SET starting_price = $1, max_guests = $2, additional_guests = $3, price_of_additional_guests = $4, advance_pay = $5
        WHERE court_id = $6
      `;
      const venuePriceValues = [
        venuePrice.startingPrice,
        venuePrice.maxGuests,
        venuePrice.additionalGuests,
        venuePrice.priceOfAdditionalGuests,
        venuePrice.advancePay,
        courtId,
      ];
      await client.query(venuePriceQuery, venuePriceValues);
    }

    // 4. Update court_includes
    if (courtIncludes) {
      const courtIncludesQuery = `
        UPDATE court_includes 
        SET badminton_racket = $1, bats = $2, hitting_machines = $3, multiple_courts = $4, spare_players = $5, instant_racket = $6, green_turfs = $7 
        WHERE court_id = $8
      `;
      const courtIncludesValues = [
        courtIncludes.badmintonRacket,
        courtIncludes.bats,
        courtIncludes.hittingMachines,
        courtIncludes.multipleCourts,
        courtIncludes.sparePlayers,
        courtIncludes.instantRacket,
        courtIncludes.greenTurfs,
        courtId,
      ];
      await client.query(courtIncludesQuery, courtIncludesValues);
    }

    // 5. Update amenities
    if (amenities) {
      const amenitiesQuery = `
        UPDATE amenities 
        SET parking = $1, drinking_water = $2, first_aid = $3, change_room = $4, shower = $5 
        WHERE court_id = $6
      `;
      const amenitiesValues = [
        amenities.parking,
        amenities.drinkingWater,
        amenities.firstAid,
        amenities.changeRoom,
        amenities.shower,
        courtId,
      ];
      await client.query(amenitiesQuery, amenitiesValues);
    }

    // 6. Update court images (delete existing and insert new)
    const deleteImagesQuery = `DELETE FROM court_images WHERE court_id = $1`;
    await client.query(deleteImagesQuery, [courtId]);

    const removeFolder = path.join(
      __dirname,
      `../../uploads/${userId}/${courtId}`
    );

    if (fs.existsSync(removeFolder)) {
      await fs.promises.rm(removeFolder, { recursive: true });
    }
    if (courtImages && courtImages.length > 0) {
      const uploadDir = path.join(
        __dirname,
        `../../uploads/${userId}/${courtId}`
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const courtImagesQuery = `INSERT INTO court_images (court_id, image_url) VALUES ($1, $2)`;

      for (const image of courtImages) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = `${uniqueSuffix}.webp`;

        // Process image with sharp
        await sharp(image.buffer)
          .resize(800, 600) // Resize as needed
          .webp({ quality: 80 }) // Convert to WebP format
          .toFile(path.join(uploadDir, fileName));

        const imageUrl = `${fileName}`;
        await client.query(courtImagesQuery, [courtId, imageUrl]);
      }
    }

    // 7. Update court availability (delete existing and insert new)
    const deleteAvailabilityQuery = `DELETE FROM court_availability WHERE court_id = $1`;
    await client.query(deleteAvailabilityQuery, [courtId]);

    if (courtAvailability) {
      const availabilityQuery = `INSERT INTO court_availability (court_id, day_of_week, duration, start_time, end_time) VALUES ($1, $2, $3, $4, $5)`;
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
    }

    // Commit the transaction
    await client.query("COMMIT");
    res.status(200).json({ message: "Court updated successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to update court" });
  } finally {
    client.release();
  }
};

module.exports = { editCourt, upload };
