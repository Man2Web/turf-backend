const db = require("../config/database");
const getCourtByUid = require("./court/getCourtIdByUid");

const fetchCourtWithId = async (req, res) => {
  const { adminId, courtId } = req.params;

  if (!adminId) {
    return res.status(404).json({ message: "You don't have the permission" });
  }

  try {
    // Fetch Court ID.
    const court__id = await getCourtByUid(courtId);

    // Fetch the court associated with the adminId and courtId
    const courtQuery = "SELECT * FROM courts WHERE user_id = $1 AND id = $2";
    const courtResult = await db.query(courtQuery, [adminId, court__id]);

    if (courtResult.rows.length === 0) {
      return res.status(404).json({ message: "No court found for this user" });
    }

    const court = courtResult.rows[0];
    const {
      court_name,
      court_type,
      venue_overview,
      rules_of_venue,
      id: court_id,
      email,
      phone_number,
    } = court;

    // Fetch the location details
    const locationQuery = "SELECT * FROM locations WHERE court_id = $1";
    const locationResult = await db.query(locationQuery, [court_id]);

    if (locationResult.rows.length === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    const { country, city, location_link, embed_link } = locationResult.rows[0];

    // Fetch the pricing details
    const pricingQuery = "SELECT * FROM venue_price WHERE court_id = $1";
    const pricingResult = await db.query(pricingQuery, [court_id]);

    if (pricingResult.rows.length === 0) {
      return res.status(404).json({ message: "Pricing information not found" });
    }

    const {
      starting_price,
      max_guests,
      additional_guests,
      price_of_additional_guests,
    } = pricingResult.rows[0];

    // Fetching the court availability
    const timeSlotQuery =
      "SELECT * FROM court_availability WHERE court_id = $1";
    const timeSlotResult = await db.query(timeSlotQuery, [court_id]);
    const timeSlotsData = timeSlotResult.rows;
    // console.log(timeSlotsData);

    if (timeSlotResult.rows.length === 0) {
      return res.status(404).json({ message: "Time slots not found" });
    }

    const filteredTimeSlots = timeSlotsData.map(
      ({ id, court_id, ...rest }) => rest
    );

    // Fetching amenities of the court
    const amenitiesQuery = "SELECT * FROM amenities WHERE court_id = $1";
    const amenitiesResult = await db.query(amenitiesQuery, [court_id]);
    const amenitiesData = amenitiesResult.rows[0];

    if (amenitiesResult.rows.length === 0) {
      return res.status(404).json({ message: "Amenities not found" });
    }

    // Fetching Includes of the court
    const includesQuery = "SELECT * FROM court_includes WHERE court_id = $1";
    const includesResult = await db.query(includesQuery, [court_id]);
    const includesData = includesResult.rows[0];

    if (includesResult.rows.length === 0) {
      return res.status(404).json({ message: "Includes not found" });
    }

    // Fetch the court images
    const imagesQuery = "SELECT * FROM court_images WHERE court_id = $1";
    const imagesResult = await db.query(imagesQuery, [court_id]);

    // console.log(imagesResult.rows)

    if (imagesResult.rows.length === 0) {
      return res.status(404).json({ message: "Images not found" });
    }

    // Build the court object with all related data
    const courtData = {
      court_id,
      court_name,
      court_type,
      venue_overview,
      rules_of_venue,
      email,
      phone_number,
      location: {
        country,
        city,
        location_link,
        embed_link,
      },
      time_Slots: filteredTimeSlots,
      amenities: amenitiesData,
      includes: includesData,
      pricing: {
        starting_price,
        max_guests,
        additional_guests,
        price_of_additional_guests,
      },
      images: imagesResult.rows,
    };

    // Send back the court data
    res.status(200).json({
      message: "Success",
      court: courtData,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { fetchCourtWithId };
