const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
var html_to_pdf = require("html-pdf-node");
const db = require("../../config/database");
const formatDate = require("../../services/formatDate");
const formatTime = require("../../services/formatTime");
const getSlotDurationInHrs = require("../../services/getSlotDuration");

const bookingDetails = async (transaction_id, pdf) => {
  const templatePath = path.join(
    __dirname,
    "../../types/emailConfirmation.ejs"
  );

  try {
    // Updated query with jsonb_build_object for grouped data
    const bookingDetailsQuery = `
  SELECT bookings.*,
    json_build_object(
      'court_id', courts.court_id,
      'admin_id', courts.admin_id,
      'featured', courts.featured,
      'court_name', courts.court_name,
      'court_type', courts.court_type
    ) AS court_info,
    json_build_object(
      'email', booking_details.email,
      'phone_number', booking_details.phone_number,
      'location', booking_details.location,
      'fname', booking_details.fname,
      'lname', booking_details.lname,
      'city', booking_details.city,
      'pincode', booking_details.pincode,
      'guests', booking_details.guests,
      'add_guests', booking_details.add_guests,
      'payment_type', booking_details.payment_type,
      'pg_type', booking_details.pg_type,
      'bank_id', booking_details.bank_id,
      'state', booking_details.state,
      'pg_tid', booking_details.pg_tid,
      'card_type', booking_details.card_type,
      'country', booking_details.country
    ) AS booking_info,
    json_build_object(
      'city', court_details.city,
      'location_link', court_details.location_link,
      'price', court_details.price,
      'add_price', court_details.add_price,
      'guests', court_details.guests,
      'add_guests', court_details.add_guests,
      'email', court_details.email,
      'phone_number', court_details.phone_number,
      'images', court_details.images,
      'advance_pay', court_details.advance_pay
    ) as court_details,
    (
      SELECT COUNT(*) 
      FROM bookings
      JOIN booking_details ON bookings.booking_detail_id = booking_details.id
      JOIN courts ON bookings.court_id = courts.id
      JOIN court_details ON courts.id = court_details.court_id
      WHERE bookings.user_id = $1 
      AND bookings.booking_date >= NOW()
    ) AS total_count
  FROM bookings
  JOIN booking_details ON bookings.booking_detail_id = booking_details.id
  JOIN courts ON bookings.court_id = courts.id
  JOIN court_details ON courts.id = court_details.court_id
  WHERE bookings.transaction_id = $1
  `;

    const bookingDetailsResult = await db.query(bookingDetailsQuery, [
      transaction_id,
    ]);

    // Check if there is any result
    if (!bookingDetailsResult.rows.length) {
      throw new Error("No booking found for the given transaction ID.");
    }

    const bookingData = bookingDetailsResult.rows[0];

    console.log(bookingData);

    if (!pdf) {
      // Render the email template with the booking data
      const emailConfirmation = await ejs.renderFile(templatePath, {
        transaction_id,
        bookingData,
        formatDate,
        formatTime,
        getSlotDurationInHrs,
      });

      // Move sendEmail function definition here
      const sendEmail = async (userEmail, emailContent) => {
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: {
              user: process.env.COMPANY_EMAIL,
              pass: process.env.COMPANY_EMAIL_PASS,
            },
          });
          const info = await transporter.sendMail({
            from: `"Man2Web" <${process.env.COMPANY_EMAIL}>`,
            to: userEmail,
            subject: "Booking Confirmation",
            text: "Your booking has been confirmed!",
            html: emailContent,
          });

          console.log("Message sent: %s", info.messageId);
        } catch (error) {
          console.log("Error sending email:", error);
          throw new Error("Failed to send email.");
        }
      };

      // Call sendEmail after defining it
      await sendEmail(bookingData.booking_details.email, emailConfirmation);
    } else {
      const emailConfirmation = await ejs.renderFile(
        path.join(__dirname, "../../types/emailConfirmation.ejs"),
        {
          transaction_id,
          bookingData: bookingData,
          formatDate: formatDate,
          formatTime: formatTime,
          getSlotDurationInHrs: getSlotDurationInHrs,
        }
      );

      let options = {
        printBackground: true, // prints background images
        preferCSSPageSize: true, // fits everything into a single page based on content
        format: "A4",
      };

      const pdfData = await html_to_pdf.generatePdf(
        { content: emailConfirmation },
        options
      );
      return pdfData;
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { bookingDetails };
