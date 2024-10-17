const { bookingDetails } = require("../../models/payment/bookingDetails");

const getBookingPdf = async (req, res) => {
  const { t_id } = req.params;
  try {
    const pdfBuffer = await bookingDetails(t_id, true);

    // Check if PDF buffer is valid
    if (!pdfBuffer) {
      throw new Error("Failed to generate PDF");
    }

    // Set headers for PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="booking-confirmation.pdf"',
      "Content-Length": pdfBuffer.length, // Set the correct content length
    });

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};

module.exports = getBookingPdf;
