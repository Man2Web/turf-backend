const db = require("../../config/database");
const getCourtByUid = require("../court/getCourtIdByUid");

const addUserReview = async (req, res) => {
  const {
    title,
    description,
    rating,
    court_id,
    user_id,
    booking_details_id,
    transaction_id,
  } = req.body;

  try {
    const courtId = await getCourtByUid(court_id);

    // Check if the review already exists for the given court_id and transaction_id
    const getReviewQuery = `
      SELECT * FROM court_reviews 
      WHERE court_id = $1 AND transaction_id = $2 AND user_id = $3`;
    const getReviewRes = await db.query(getReviewQuery, [
      courtId,
      transaction_id,
      user_id,
    ]);

    // If a review already exists, return an error
    if (getReviewRes.rows.length > 0) {
      return res.status(400).json({ message: "Review already exists" });
    }

    // Insert the new review into the database
    const insertReviewQuery = `
      INSERT INTO court_reviews (court_id, transaction_id, user_id, title, description, rating, booking_details_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;`; // Return the inserted review

    const insertReviewRes = await db.query(insertReviewQuery, [
      courtId,
      transaction_id,
      user_id,
      title,
      description,
      rating,
      booking_details_id,
    ]);

    // Send the inserted review as a response
    res.status(201).json(insertReviewRes.rows[0]); // Respond with the created review
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = addUserReview;
