const db = require("../../config/database");

const checkReview = async (prevBookingData) => {
  const reviewsData = [];

  for (const booking of prevBookingData) {
    // console.log(booking);
    const {
      booking_date,
      booking_time,
      court_id,
      user_id,
      booking_detail_id,
      transaction_id,
    } = booking;

    const checkReviewExistsQ = `
        SELECT * FROM court_reviews WHERE transaction_id = $1
    `;
    const checkReviewExistsRes = await db.query(checkReviewExistsQ, [
      transaction_id,
    ]);

    reviewsData.push(checkReviewExistsRes.rows[0]);
  }
  console.log(reviewsData);
  return reviewsData;
};

module.exports = checkReview;
