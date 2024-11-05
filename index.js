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

const authentication = require("./api/routes/authentication");
const adminRoutes = require("./api/routes/adminRoutes");
const courtRoutes = require("./api/routes/courtRoutes");
const userRoutes = require("./api/routes/userRoutes");
const paymentRoutes = require("./api/routes/paymentRoutes copy");
const bookingRoutes = require("./api/routes/bookingRoutes");
const superAdminRoutes = require("./api/routes/superAdminRoutes");

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/auth", authentication);
app.use("/court", courtRoutes);
app.use("/payment", paymentRoutes);
app.use("/booking", bookingRoutes);

app.listen(PORT, (err) => {
  if (!err) {
    console.log("Server is running on " + PORT);
  } else {
    console.log(err);
  }
});
