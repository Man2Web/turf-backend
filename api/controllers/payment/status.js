const crypto = require("crypto");
const axios = require("axios");
const db = require("../../config/database");
const { bookingDetails } = require("../../models/payment/bookingDetails");

const status = async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = process.env.DEMO_MERCHANT_ID;
  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    process.env.DEMO_SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT TATUS
  try {
    const response = await axios.request(options);
    if (response.data.success === true) {
      const transaction_id = response.data.data.merchantTransactionId;
      const { type, pgTransactionId, cardType, bankId } =
        response.data.data.paymentInstrument;

      await db.query("BEGIN");

      const getUserBookingDetailsId = await db.query(
        "UPDATE bookings SET status = TRUE where transaction_id = $1 RETURNING booking_detail_id",
        [transaction_id]
      );
      await db.query(
        "UPDATE booking_details SET payment_type = $1, pg_type = $2, card_type = $3, bank_id = $4 WHERE id = $5 RETURNING email",
        [
          type || null,
          pgTransactionId || null,
          cardType || null,
          bankId || null,
          getUserBookingDetailsId.rows[0].booking_detail_id,
        ]
      );
      await db.query("COMMIT");
      await bookingDetails(transaction_id);
      const url = `${process.env.WEBSITE_URL}booking/success/${transaction_id}`;
      return res.redirect(url);
    } else {
      await db.query("ROLLBACK");
      const url = `${process.env.WEBSITE_URL}booking/failure`;
      return res.redirect(url);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = status;
