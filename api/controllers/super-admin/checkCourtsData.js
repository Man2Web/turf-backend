const db = require("../../config/database");

const checkCourtsData = async (req, res) => {
  const getPendingCourtsQuery = `SELECT * FROM COURTS WHERE approved = FALSE`;
  const getPendingCourtsRes = await db.query(getPendingCourtsQuery);

  const getApprovedCourtsQuery = `SELECT * FROM COURTS WHERE approved = TRUE`;
  const getApprovedCourtsRes = await db.query(getApprovedCourtsQuery);

  return res.json({
    message: "Courts Data",
    pendingCourts: getPendingCourtsRes.rows,
    approvedCourts: getApprovedCourtsRes.rows,
  });
};

module.exports = checkCourtsData;
