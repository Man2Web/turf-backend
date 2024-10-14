const db = require("../../config/database");

const fetchCourtWithCourtId = async (req, res) => {
  const { courtId } = req.params;

  let adminId;

  if (!courtId) {
    return res.status(400).json({ message: "Court ID is required" });
  }

  try {
    // Fetch the court associated with the courtId
    const courtQuery = "SELECT * FROM courts WHERE id = $1";
    const courtResult = await db.query(courtQuery, [courtId]);
    // console.log(courtResult.rows[0].user_id)
    adminId = courtResult.rows[0].user_id;

    if (courtResult.rows.length === 0) {
      return res.status(404).json({ message: "No court found for this ID" });
    }

    const court = courtResult.rows[0];
    const {
      court_name,
      court_type,
      venue_overview,
      rules_of_venue,
      id: court_id,
      phone_number,
      email,
      m_name,
    } = court;

    // Fetch the location details
    const locationQuery = "SELECT * FROM locations WHERE court_id = $1";
    const locationResult = await db.query(locationQuery, [court_id]);

    const locationData = locationResult.rows[0] || {};
    const {
      country = null,
      city = null,
      location_link = null,
      embed_link = null,
    } = locationData;

    // Fetch the pricing details
    const pricingQuery = "SELECT * FROM venue_price WHERE court_id = $1";
    const pricingResult = await db.query(pricingQuery, [court_id]);

    const pricingData = pricingResult.rows[0] || {};
    const {
      starting_price = null,
      max_guests = null,
      additional_guests = null,
      price_of_additional_guests = null,
      advance_pay = null,
    } = pricingData;

    // Fetch the court availability time slots
    const timeSlotQuery =
      "SELECT * FROM court_availability WHERE court_id = $1";
    const timeSlotResult = await db.query(timeSlotQuery, [court_id]);
    const timeSlotsData = timeSlotResult.rows;
    const filteredTimeSlots = timeSlotsData.map(
      ({ id, court_id, ...rest }) => rest
    );

    // Fetch the amenities of the court
    const amenitiesQuery = "SELECT * FROM amenities WHERE court_id = $1";
    const amenitiesResult = await db.query(amenitiesQuery, [court_id]);
    const amenitiesData = amenitiesResult.rows[0] || {};

    // Fetch the includes of the court
    const includesQuery = "SELECT * FROM court_includes WHERE court_id = $1";
    const includesResult = await db.query(includesQuery, [court_id]);
    const includesData = includesResult.rows[0] || {};

    // Fetch the court images
    const imagesQuery = "SELECT * FROM court_images WHERE court_id = $1";
    const imagesResult = await db.query(imagesQuery, [court_id]);

    const baseUrl = `${req.protocol}://${req.get(
      "host"
    )}/court/uploads/${adminId}/${courtId}`;
    const images = imagesResult.rows.map((image) => {
      const cleanedImageUrl = image.image_url.replace(/^\/?uploads\//, "");
      return `${baseUrl}/${cleanedImageUrl}`;
    });

    // Build the court object with all related data
    const courtData = {
      court_id,
      court_name,
      court_type,
      venue_overview,
      rules_of_venue,
      phone_number,
      m_name,
      email,
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
        advance_pay,
      },
      images,
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

module.exports = fetchCourtWithCourtId;
