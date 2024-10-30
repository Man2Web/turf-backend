const crypto = require("crypto");
const axios = require("axios");
const getCourtByUid = require("../court/getCourtIdByUid");
const saveBookingData = require("../../models/bookings/saveBookingData");
const saveUserBookingData = require("../../models/bookings/saveUserBookingData");

const payment = async (req, res) => {
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

  const demo_merchant_Id = process.env.DEMO_MERCHANT_ID;
  const demo_salt_key = process.env.DEMO_SALT_KEY;

  try {
    let court__id = await getCourtByUid(courtId);
    if (!court__id) {
      return res.status(404).json({ message: "Court not found" });
    }
    const bookingDetailsId = await saveUserBookingData(userDetails);

    await saveBookingData(
      court__id,
      selectedDate,
      selectedSlots,
      user_id,
      transactionId,
      bookingDetailsId,
      amount,
      courtDuration,
      amountTobePaid
    );

    const data = {
      merchantId: demo_merchant_Id, // We need to chagne this to live one.
      merchantTransactionId: transactionId,
      merchantUserId: MUID,
      name: name,
      amount: amount * 100, // Amount in paise
      redirectUrl: `${process.env.BACKEND_URL}payment/status/?id=${transactionId}`,
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
    const stringToHash = payloadMain + "/pg/v1/pay" + demo_salt_key;
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const checksum = sha256 + "###" + keyIndex;

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

    const response = await axios.post(prod_URL, requestData, { headers });

    // Return the response from PhonePe API to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      message: "Payment processing failed",
      success: false,
    });
  }
};

module.exports = payment;
