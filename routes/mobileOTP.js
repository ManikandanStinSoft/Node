const express = require("express");
const router = express.Router();
const OtpController = require("../controllers/mobileOTPController");

router.post("/send", OtpController.sendOtp);

router.get("/verify", OtpController.verifyOtp);

router.get("/resend", OtpController.resendOtp);

module.exports = router;
