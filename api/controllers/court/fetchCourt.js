const db = require("../../config/database");
const convertCourtData = require("../../services/convertCourtData");

const fetchCourt = async (req, res) => {
  const adminId = req.params.id;

  if (!adminId) {
    return res.status(404).json({ message: "You don't have the permission" });
  }

  try {
    // Fetch the courts associated with the adminId
    const getCourtDataQuery = await db.query(
      `SELECT courts.*, court_details.*,
          json_build_object(
            'court_id', courts.court_id,           -- corrected from courts.court_id to courts.id
            'admin_id', courts.admin_id,
            'court_name', courts.court_name,
            'court_type', courts.court_type,
            'approved', courts.approved
          ) AS court_info
       FROM courts 
       JOIN court_details ON court_details.court_id = courts.id 
       WHERE courts.admin_id = $1`,
      [adminId]
    );

    // Check if any courts are found
    if (getCourtDataQuery.rows.length === 0) {
      return res.status(404).json({ message: "No courts found for this user" });
    }

    const courts = [];

    // Loop through all the courts and fetch related data
    for (const court of getCourtDataQuery.rows) {
      const convertedCourtData = convertCourtData(court, court.court_name);
      courts.push(convertedCourtData);
    }

    // Send back the courts data
    res.status(200).json({
      message: "Success",
      courtsData: courts,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = fetchCourt;
