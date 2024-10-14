const crypto = require("crypto");
const axios = require("axios");

const demo_merchant_Id = "PGTESTPAYUAT86"; // Example Merchant ID
const salt_key = "96434309-7796-489d-8924-ab56988a6076"; // Example Salt Key

const status = async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = demo_merchant_Id;

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
      if (response.data.success === true) {
        const url = `http://localhost:3001/booking/success`;
        return res.redirect(url);
      } else {
        const url = `http://localhost:3001/booking/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { status };
