const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const forgotPassSendEmail = async (email, uuid) => {
  const templatePath = path.join(__dirname, "../../types/forgotPass.ejs");
  const website_URL = `${process.env.WEBSITE_URL}auth/reset-password/${uuid}`;
  try {
    const forgotPassEmail = await ejs.renderFile(templatePath, {
      uuid,
      website_URL,
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
          subject: "Password Reset",
          text: "Password Reset Link",
          html: emailContent,
        });

        console.log("Message sent: %s", info.messageId);
      } catch (error) {
        console.log("Error sending email:", error);
        throw new Error("Failed to send email.");
      }
    };

    // Call sendEmail after defining it
    await sendEmail(email, forgotPassEmail);
  } catch (error) {
    console.log(error);
  }
};

module.exports = forgotPassSendEmail;
