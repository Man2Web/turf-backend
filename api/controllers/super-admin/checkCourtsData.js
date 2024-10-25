const db = require("../../config/database");

const checkCourtsData = async (req, res) => {
  const getPendingCourtsQuery = `SELECT
    json_build_object(
      'court_id', courts.court_id,
      'court_name', courts.court_name,
      'court_type', courts.court_type,
      'featured', courts.featured,
      'approved', courts.approved,
      'admin_id', courts.admin_id
    ) AS courts,
    json_build_object(
      'phone_number', court_details.phone_number
    ) AS court_details
  FROM courts
  JOIN court_details ON courts.id = court_details.court_id
  WHERE approved = FALSE`;
  const getPendingCourtsRes = await db.query(getPendingCourtsQuery);

  const getApprovedCourtsQuery = `SELECT
    json_build_object(
      'court_id', courts.court_id,
      'court_name', courts.court_name,
      'court_type', courts.court_type,
      'featured', courts.featured,
      'approved', courts.approved,
      'admin_id', courts.admin_id
    ) AS courts,
    json_build_object(
      'phone_number', court_details.phone_number
    ) AS court_details
  FROM courts
  JOIN court_details ON courts.id = court_details.court_id
  WHERE approved = TRUE`;
  const getApprovedCourtsRes = await db.query(getApprovedCourtsQuery);

  return res.json({
    message: "Courts Data",
    pendingCourts: getPendingCourtsRes.rows,
    approvedCourts: getApprovedCourtsRes.rows,
  });
};

module.exports = checkCourtsData;
