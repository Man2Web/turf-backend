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
    SELECT 
      bookings.id AS booking_id,
      bookings.booking_date, 
      bookings.booking_time, 
      bookings.amount_paid, 
      bookings.pay_required, 
      bookings.duration, 
      bookings.payment_mode,
      bookings.transaction_id,
      bookings.booked_on,

      -- Court details as JSON
      jsonb_build_object( 
        'court_id', courts.court_id, 
        'court_name', courts.court_name, 
        'email', courts.email, 
        'phone_number', courts.phone_number, 
        'court_type', courts.court_type, 
        'venue_overview', courts.venue_overview, 
        'rules_of_venue', courts.rules_of_venue, 
        'featured', courts.featured
      ) AS courtData,

      -- Booking details as JSON
      jsonb_build_object(
        'phone_number', booking_details.phone_number, 
        'email', booking_details.email, 
        'fname', booking_details.fname, 
        'lname', booking_details.lname, 
        'guests', booking_details.guests, 
        'add_guests', booking_details.add_guests, 
        'city', booking_details.city, 
        'pincode', booking_details.pincode, 
        'state', booking_details.state, 
        'country', booking_details.country,
        'pg_tid', booking_details.pg_tid,
        'payment_type', booking_details.payment_type,
        'card_type', booking_details.card_type,
        'bank_id', booking_details.bank_id
      ) AS bookingDetailsData,

      -- Location details as JSON
      jsonb_build_object(
        'city', locations.city, 
        'country', locations.country, 
        'location_link', locations.location_link, 
        'embed_link', locations.embed_link
      ) AS locationData

    FROM bookings
    LEFT JOIN courts ON courts.id = bookings.court_id
    LEFT JOIN booking_details ON booking_details.id = bookings.booking_detail_id
    LEFT JOIN locations ON locations.court_id = courts.id
    WHERE bookings.transaction_id = $1;
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
