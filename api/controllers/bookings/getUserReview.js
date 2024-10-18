const db = require("../../config/database");
const getCourtByUid = require("../court/getCourtIdByUid");

const getUserReview = async (req, res) => {
  const { courtId, T_Id } = req.params;

  try {
    const court_id = await getCourtByUid(courtId);

    const getReviewQuery =
      "SELECT * FROM court_reviews WHERE court_id = $1 AND transaction_id = $2";
    const getReviewRes = await db.query(getReviewQuery, [court_id, T_Id]);

    console.log(getReviewRes.rows);

    res.status(200).json(getReviewRes.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getUserReview;
