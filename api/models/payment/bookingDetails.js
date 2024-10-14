const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true, // Set to true if using port 465
  auth: {
    user: "harsha.vardhan@man2web.com", // Make sure this is the correct user
    pass: "Djsnake@1", // Make sure this is the correct password
  },
});

const bookingDetails = async (
  userEmail,
  court_name,
  total_price,
  transaction_id
) => {
  const current_date = new Date();
  const day = current_date.getDay();
  const month = current_date.getMonth();
  const date = current_date.getDate();
  const year = current_date.getFullYear();
  try {
    const info = await transporter.sendMail({
      from: '"Man2Web" <harsha.vardhan@man2web.com>',
      to: userEmail,
      subject: "Booking Confirmation",
      text: "Your booking has been confirmed!", // More descriptive text
      html: `<h1>Booking Confirmation</h1>
      <p>Your booking has been confirmed!</p>
      <h1>Court Information</h1><br />
      <p>Court Name: ${court_name}</p>
      <p>Total Price: ${total_price}</p>
      <p>Paid On: ${(day, month, date, year)}</p>
      <p>Transaction ID: ${transaction_id}</p>
      <p>Payment Type: Online</p>`, // More descriptive HTML
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { bookingDetails };
