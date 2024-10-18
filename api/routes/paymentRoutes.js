const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment");
const db = require("../config/database");
const { payment } = require("../controllers/payment/payment");
const { status } = require("../controllers/payment/status");
const { bookingDetails } = require("../models/payment/bookingDetails");
const formatTime = require("../services/formatTime");
const formatDate = require("../services/formatDate");
const getSlotDurationInHrs = require("../services/getSlotDuration");
const getCourtByUid = require("../controllers/court/getCourtIdByUid");
const router = express.Router();

const demo_merchant_Id = "PGTESTPAYUAT86"; // Example Merchant ID
const salt_key = "96434309-7796-489d-8924-ab56988a6076"; // Example Salt Key
let user_details;
let selected_date;
let selected_slots;
let court__id;
let userId;
let total_price;
let transaction_id;
let court_duration;
let tobePaid;

// Exponential backoff function to handle retries for rate-limited requests
async function makeRequestWithBackoff(
  url,
  headers,
  data,
  retries = 5,
  backoff = 1000
) {
  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      console.log(`Rate limit exceeded. Retrying in ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return makeRequestWithBackoff(
        url,
        headers,
        data,
        retries - 1,
        backoff * 2
      );
    } else {
      throw error; // Rethrow the error if it's not a 429 or retries are exhausted
    }
  }
}

router.post("/", async (req, res) => {
  const {
    name,
    amount,
    amountTobePaid,
    number,
    transactionId,
    MUID,
    userDetails,
    selectedDate,
    selectedSlots,
    courtId,
    user_id,
    courtDuration,
  } = req.body;
  user_details = userDetails;
  selected_date = selectedDate;
  selected_slots = selectedSlots;
  court__id = courtId;
  userId = user_id;
  total_price = amount;
  transaction_id = transactionId;
  court_duration = courtDuration;
  tobePaid = amountTobePaid;

  const demo_merchant_Id = "PGTESTPAYUAT86"; // Example Merchant ID
  //   "PGTESTPAYUAT86"
  const salt_key = "96434309-7796-489d-8924-ab56988a6076"; // Example Salt Key
  //   "96434309-7796-489d-8924-ab56988a6076"
  try {
    court__id = await getCourtByUid(courtId);
    if (!court__id) {
      return res.status(404).json({ message: "Court not found" });
    }

    // // First, fetch the user_id associated with the court_id from the courts table
    // const userIdQuery = `
    //   SELECT user_id
    //   FROM courts
    //   WHERE id = $1;
    // `;
    // const userIdResult = await db.query(userIdQuery, [court__id]);

    // if (userIdResult.rows.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "User not found for the given court ID" });
    // }

    // const associatedUserId = userIdResult.rows[0].user_id;

    // // Now, fetch the m_id from the users table using the retrieved user_id
    // const mIdQuery = `
    //   SELECT m_id
    //   FROM users
    //   WHERE id = $1;
    // `;
    // const mIdResult = await db.query(mIdQuery, [associatedUserId]);

    // if (mIdResult.rows.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Merchant ID not found for the user" });
    // }

    // const merchantId = mIdResult.rows[0].m_id;
    const merchantId = demo_merchant_Id;

    // console.log(merchantId);

    // Prepare data for PhonePe API request
    const merchant_id = merchantId;
    const merchantTransactionId = transactionId;

    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: MUID,
      name: name,
      amount: amount * 100, // Amount in paise
      redirectUrl: `http://localhost:4000/payment/status/?id=${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Encode payload to Base64
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");

    // Generate checksum using SHA256
    const keyIndex = 1;
    const stringToHash = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    // API endpoint (sandbox or production)
    // Demo UR:
    // const prod_URL =
    //   "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    // Prod URL
    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    // Headers and data for the request
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    };

    const userBookingRequest = {
      userDetails,
      selectedDate,
      selectedSlots,
    };

    const requestData = {
      request: payloadMain,
      requestedBookingDetails: userBookingRequest,
    };

    // Make the request using the retry strategy with exponential backoff
    const response = await makeRequestWithBackoff(
      prod_URL,
      headers,
      requestData
    );

    // const options = {
    //   method: "POST",
    //   url: prod_URL,
    //   headers: {
    //     accept: "application/json",
    //     "content-type": "application/json",
    //     "X-VERIFY": checksum,
    //   },
    //   data: {
    //     payloadMain,
    //   },
    // };

    // await axios.post(options).then((response) => {
    //   res.status(200).json(response.data);
    // });

    // Return the response from PhonePe API to the client
    return res.status(200).json(response);
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      message: "Payment processing failed",
      success: false,
    });
  }
});

router.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = demo_merchant_Id;
  console.log(user_details);
  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
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
  axios
    .request(options)
    .then(async (response) => {
      console.log(response.data.data.paymentInstrument);
      const paymentType = response.data.data.paymentInstrument.type;
      const pg_TID = response.data.data.paymentInstrument.pgTransactionId;
      const cardType = response.data.data.paymentInstrument.cardType;
      const bankId = response.data.data.paymentInstrument.bankId;

      if (response.data.success === true) {
        const client = await db.pool.connect();

        try {
          await client.query("BEGIN");

          const userDetailsQuery = `
                INSERT INTO booking_details (fName, lName, phone_number, email, location, city, country, pincode, guests, add_guests, payment_type, pg_tid, card_type, bank_id, state)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id;
              `;

          const userDetailsValues = [
            user_details.fName,
            user_details.lName,
            user_details.phonenumber,
            user_details.email,
            user_details.address,
            user_details.city,
            user_details.country,
            user_details.pincode,
            user_details.numberOfGuests,
            user_details.additionalNumberOfGuests,
            paymentType,
            pg_TID,
            cardType,
            bankId,
            user_details.state,
          ];

          const result = await db.query(userDetailsQuery, userDetailsValues);
          const bookingDetailsId = result.rows[0].id;

          const courtQuery = "SELECT * FROM courts WHERE id = $1";
          const courtResult = await db.query(courtQuery, [court__id]);
          const court = courtResult.rows[0];

          const adminId = court.user_id;

          const timeSlotsArr = [];
          // Insert each selected slot into the bookings table
          for (const slot of selected_slots) {
            const timeInHHMMSS = `${slot.slot.time}:00`;
            timeSlotsArr.push(timeInHHMMSS);
          }
          const bookingQuery = `
                INSERT INTO bookings (admin_id, court_id, booking_date, booking_time, user_id, transaction_id, booking_detail_id, amount_paid, duration, pay_required, payment_mode)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
              `;

          const bookingValues = [
            adminId,
            court__id,
            selected_slots[0].date, // Assuming selected_date is in the correct date format
            timeSlotsArr, // slot.time should be in 'HH:MM:SS' format
            userId, // If user_id is undefined, it will insert NULL
            transaction_id,
            bookingDetailsId,
            Number(total_price),
            court_duration,
            Number(tobePaid),
            true, // payment mode set to true for online
          ];

          await db.query(bookingQuery, bookingValues);

          await client.query("COMMIT");

          if (user_details.email) {
            await bookingDetails(transaction_id);
          }

          const url = `${process.env.WEBSITE_URL}booking/success/${transaction_id}`;
          return res.redirect(url);
        } catch (error) {
          await client.query("ROLLBACK");
          console.log(error);
          res.status(500).json({ message: "Internal Server Error" });
        } finally {
          client.release();
        }
      } else {
        const url = `${process.env.WEBSITE_URL}booking/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post("/admin", async (req, res) => {
  // console.log(req.body); // This will help you verify the incoming structure

  try {
    // Correcting destructuring to match req.body keys
    let {
      userDetails, // This matches the "userDetails" key in the request body
      selectedDate, // This matches "selectedDate"
      selectedSlots, // This matches "selectedSlots"
      amount: total_price, // "amount" is renamed to "total_price" for usage
      courtId: court__id, // "courtId" is renamed to "court__id" for usage
      transactionId: transaction_id, // "transactionId" is renamed to "transaction_id"
      user_id: userId, // "user_id" is renamed to "userId" for usage
      courtDuration,
    } = req.body;

    court__id = await getCourtByUid(court__id);

    console.log(court__id);

    court_duration = courtDuration;
    // console.log(userDetails, selectedDate, selectedSlots);

    // Insert user details into booking_details table
    const userDetailsQuery = `
              INSERT INTO booking_details (fName, lName, phone_number, email, guests, add_guests, payment_type, pg_tid, card_type, bank_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id;
            `;

    const userDetailsValues = [
      userDetails.fName,
      userDetails.lName,
      userDetails.phonenumber || "DBU",
      userDetails.email || "DBU",
      userDetails.numberOfGuests,
      userDetails.additionalNumberOfGuests,
      null,
      null,
      null,
      null,
    ];

    const result = await db.query(userDetailsQuery, userDetailsValues);
    const bookingDetailsId = result.rows[0].id;

    // Fetch court details
    const courtQuery = "SELECT * FROM courts WHERE id = $1";
    const courtResult = await db.query(courtQuery, [court__id]);
    const court = courtResult.rows[0];

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    const {
      court_name,
      user_id, // This is the user_id associated with the court (admin of the court)
      court_type,
      venue_overview,
      rules_of_venue,
      id: court_id,
    } = court;

    // Check if the userId matches the adminId (the owner of the court)
    if (Number(userId) !== Number(court.user_id)) {
      return res.status(403).json({
        message: "User is not authorized to book this court",
      });
    }
    const timeSlotsArr = [];
    console.log(selectedSlots);
    // Insert each selected slot into the bookings table
    for (const slot of selectedSlots) {
      const timeInHHMMSS = `${slot.slot.time}:00`; // Append ':00' to convert to 'HH:MM:SS'
      timeSlotsArr.push(timeInHHMMSS);
    }
    const bookingQuery = `
    INSERT INTO bookings (admin_id, court_id, booking_date, booking_time, user_id, transaction_id, booking_detail_id, amount_paid, payment_mode, duration, pay_required)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
  `;

    const bookingValues = [
      Number(userId), // Assuming this is the admin ID
      court__id,
      selectedSlots[0].date, // Assuming selectedDate is in the correct date format
      timeSlotsArr, // slot.time should be in 'HH:MM:SS' format
      Number(userId), // Passing userId to record which user made the booking
      transaction_id,
      bookingDetailsId,
      Number(total_price),
      false, // Assuming false represents cash payment
      court_duration,
      0,
    ];

    await db.query(bookingQuery, bookingValues);
    return res
      .status(200)
      .json({ message: "Booking Successful", transaction_id: transaction_id });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ message: "Booking Failed" });
  }
});

module.exports = router;
