const crypto = require("crypto");
const axios = require("axios");

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

const payment = async (req, res) => {
  const {
    name,
    amount,
    number,
    transactionId,
    MUID,
    userDetails,
    selectedDate,
    selectedSlots,
  } = req.body;
  const {} = req.body;
  console.log(req.body);
  const demo_merchant_Id = "PGTESTPAYUAT86"; // Example Merchant ID
  //   "PGTESTPAYUAT86"
  const salt_key = "96434309-7796-489d-8924-ab56988a6076"; // Example Salt Key
  //   "96434309-7796-489d-8924-ab56988a6076"
  try {
    // Prepare data for PhonePe API request
    const merchant_id = demo_merchant_Id;
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

    console.log(response);

    // Return the response from PhonePe API to the client
    // return res.status(200).json(response);
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      message: "Payment processing failed",
      success: false,
    });
  }
};

module.exports = { payment };
