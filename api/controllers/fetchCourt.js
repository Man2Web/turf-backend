const db = require("../config/database");

const fetchCourt = async (req, res) => {
  const adminId = req.params.id;

  if (!adminId) {
    return res.status(404).json({ message: "You don't have the permission" });
  }

  try {
    // Fetch the courts associated with the adminId
    const courtQuery = "SELECT * FROM courts WHERE user_id = $1";
    const courtResult = await db.query(courtQuery, [adminId]);

    // Check if any courts are found
    if (courtResult.rows.length === 0) {
      return res.status(404).json({ message: "No courts found for this user" });
    }

    const courts = [];

    // Loop through all the courts and fetch related data
    for (const court of courtResult.rows) {
      const {
        court_name,
        court_type,
        venue_overview,
        rules_of_venue,
        id: court_id,
        approved,
        user_id,
      } = court;

      // Fetch the location details using court_id
      const locationQuery = "SELECT * FROM locations WHERE court_id = $1";
      const locationResult = await db.query(locationQuery, [court_id]);
      const locationData = locationResult.rows[0] || {}; // Handle no location found

      const {
        country = null,
        city = null,
        location_link = null,
      } = locationData;

      // Fetch the pricing details
      const pricingQuery = "SELECT * FROM venue_price WHERE court_id = $1";
      const pricingResult = await db.query(pricingQuery, [court_id]);

      if (pricingResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Pricing information not found" });
      }

      const {
        starting_price,
        max_guests,
        additional_guests,
        price_of_additional_guests,
      } = pricingResult.rows[0];

      // Fetch the court images
      const imagesQuery = "SELECT * FROM court_images WHERE court_id = $1";
      const imagesResult = await db.query(imagesQuery, [court_id]);

      const images = imagesResult.rows.map((image) => image.image_url); // Assuming `image_url` is the column name for images

      // Build the court object with all related data
      courts.push({
        court_id,
        court_name,
        court_type,
        venue_overview,
        rules_of_venue,
        approved,
        location: {
          country,
          city,
          location_link,
        },
        pricing: {
          starting_price,
          max_guests,
          additional_guests,
          price_of_additional_guests,
        },
        images,
      });
    }

    // Send back the courts data
    res.status(200).json({
      message: "Success",
      courts,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { fetchCourt };
