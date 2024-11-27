const db = require("../../config/database");
const getCourtByUid = require("./getCourtIdByUid");

const getCourtRating = async (req, res) => {
  const { courtId } = req.params;
  if (!courtId) {
    return res.status(404).json({ message: "Court ID is required" });
  }
  const court_Id = await getCourtByUid(courtId);
  if (!court_Id) {
    return res.status(404).json({ message: "Invalid Court ID" });
  }
  try {
    const reviewQuery = `
      SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS total_rating, COUNT(*) AS total_reviews FROM court_reviews WHERE court_id = $1;
    `;
    const reviewsData = await db.query(reviewQuery, [court_Id]);
    res.status(200).json({
      message: "Success",
      reviewsData: reviewsData.rows[0],
    });
  } catch (error) {
    console.error("Error in transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getCourtRating;
