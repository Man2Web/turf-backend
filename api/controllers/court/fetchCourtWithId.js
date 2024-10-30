const db = require("../../config/database");
const getCourtByUid = require("./getCourtIdByUid");

const fetchCourtWithId = async (req, res) => {
  const { adminId, courtId } = req.params;

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
            'court_type', courts.court_type
          ) AS court_info
       FROM courts 
       JOIN court_details ON court_details.court_id = courts.id 
       WHERE courts.admin_id = $1 AND courts.court_id = $2`,
      [adminId, courtId]
    );

    // Check if any courts are found
    if (getCourtDataQuery.rows.length === 0) {
      return res.status(404).json({ message: "No courts found for this user" });
    }

    const court = getCourtDataQuery.rows[0];

    // Send back the courts data
    res.status(200).json({
      message: "Success",
      courtData: court,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = fetchCourtWithId;
