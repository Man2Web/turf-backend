const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const axios = require("axios");
const db = require("../../config/database");
const formatDate = require("../../services/formatDate");
const formatTime = require("../../services/formatTime");
const getSlotDurationInHrs = require("../../services/getSlotDuration");

const bookingDetails = async (transaction_id) => {
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
        'country', booking_details.country
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

    const bookingRow = bookingDetailsResult.rows[0];

    // Map over the rows to get booking-specific details
    const bookings = bookingDetailsResult.rows.map((row) => ({
      booking_id: row.booking_id,
      booking_date: row.booking_date,
      booking_time: row.booking_time,
      booked_on: row.booked_on,
      amount_paid: row.amount_paid,
      pay_required: row.pay_required,
      duration: row.duration,
      add_guests: row.add_guests,
      guests: row.guests,
    }));

    // Prepare data for email template
    const bookingData = {
      transaction_id: bookingRow.transaction_id,
      courtData: bookingRow.courtdata,
      bookingDetailsData: bookingRow.bookingdetailsdata,
      locationData: bookingRow.locationdata,
      bookings,
    };

    // Render the email template with the booking data
    const emailConfirmation = await ejs.renderFile(templatePath, {
      transaction_id,
      bookingData,
      formatDate,
      formatTime,
      getSlotDurationInHrs,
    });
    console.log(bookingRow.bookingdetailsdata.email);

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
    await sendEmail(bookingRow.bookingdetailsdata.email, emailConfirmation);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { bookingDetails };
