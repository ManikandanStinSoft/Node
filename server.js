const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const otpRoutes = require("./routes/mobileOTP");
const personalLoanRoutes = require("./routes/personalLoanRoutes");
const homeLoanRoutes = require("./routes/homeLoanRoutes");
const scheduleRoutes = require("./routes/scheduleEmiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { generatePresignedUrl } = require("./utils/s3");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:59673"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/fetch-image", async (req, res) => {
  const { filePath, fileName } = req.query;
  try {
    const presignedUrl = await generatePresignedUrl(filePath, fileName);
    const response = await axios.get(presignedUrl, {
      responseType: "arraybuffer",
    });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Error fetching image");
  }
});

app.use("/api/finance/otp", otpRoutes);
app.use("/api/finance/personal-loans", personalLoanRoutes);
app.use("/api/finance/home-loans", homeLoanRoutes);
app.use("/api/finance/admins", adminRoutes);
app.use("/api/finance/emi", scheduleRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
