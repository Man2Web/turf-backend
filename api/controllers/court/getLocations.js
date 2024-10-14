const db = require("../../config/database");

const getLocations = async (req, res) => {
  try {
    const locationsQuery = "SELECT city FROM locations";
    const locationsRes = await db.query(locationsQuery);
    const uniqueCities = Array.from(
      new Set(locationsRes.rows.map((location) => location.city))
    );
    res.status(200).json({ locations: uniqueCities, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getLocations };
