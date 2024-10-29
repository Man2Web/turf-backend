const db = require("../../config/database");
const { v4: uuid } = require("uuid");
const forgotPassSendEmail = require("../../models/users/forgotPassSendEmail");

const forgotPassword = async (req, res) => {
  const { email } = req.params;
  try {
    const userDetails = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userDetails.rows.length === 0) {
      return res.status(404).json({ message: "Invalid Request" });
    }
    const checkIfAlreadyExists = await db.query(
      "SELECT * FROM pass_reset WHERE user_id = $1",
      [userDetails.rows[0].id]
    );
    if (checkIfAlreadyExists.rows.length > 0) {
      return res.status(409).json({
        message:
          "Link has already been sent to the user email to reset the password",
      });
    }
    const uniqueId = uuid();
    const userDetailsData = userDetails.rows[0];
    try {
      const resetQuery = `INSERT INTO pass_reset (user_id, token) VALUES($1, $2) RETURNING token`;
      const resetRes = await db.query(resetQuery, [
        userDetailsData.id,
        uniqueId,
      ]);
      forgotPassSendEmail(
        "javvajiharshavardhan.24@gmail.com",
        resetRes.rows[0].token
      );
      return res.status(200).json({
        message: "A link to reset your password has been sent to your email.",
      });
    } catch (error) {
      return res.status(500).json({ message: "Please try again later" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = forgotPassword;
