const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    origin: process.env.WEBSITE_URL_BASE,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;

const authentication = require("./routes/authentication");
const adminRoutes = require("./routes/adminRoutes");
const courtRoutes = require("./routes/courtRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/auth", authentication);
app.use("/court", courtRoutes);
app.use("/payment", paymentRoutes);
app.use("/booking", bookingRoutes);

module.exports = app;
