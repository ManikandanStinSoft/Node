const express = require("express");
const http = require("https");
require("dotenv").config();

let sentOtp;
let otpExpiryTime;

exports.sendOtp = function (req, res) {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  const options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: `/api/v5/otp?otp_expiry=${
      process.env.MSG91_OTP_EXPIRY || 5
    }&template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${mobile}&authkey=${
      process.env.MSG91_AUTH_KEY
    }&realTimeResponse=1`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const reqOTP = http.request(options, (resOTP) => {
    const chunks = [];

    resOTP.on("data", (chunk) => {
      chunks.push(chunk);
    });

    resOTP.on("end", () => {
      const body = Buffer.concat(chunks);
      try {
        const response = JSON.parse(body);
        if (response.type === "success") {
          sentOtp = response.otp;
          otpExpiryTime =
            Date.now() + (process.env.MSG91_OTP_EXPIRY || 5) * 60 * 1000;
          res
            .status(200)
            .json({ message: "OTP sent successfully", data: response, status : 200  });
        } else {
          res
            .status(500)
            .json({ message: "Failed to send OTP", error: response });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to parse OTP response", error });
      }
    });
  });

  reqOTP.on("error", (error) => {
    // console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  });

  reqOTP.end();
};

exports.verifyOtp = function (req, res) {
  const { mobile, otp } = req.query;
  if (!mobile || !otp) {
      return res
          .status(400)
          .json({ message: "Mobile number and OTP are required" });
  }
  if (Date.now() > otpExpiryTime) {
      return res.status(400).json({ message: "OTP expired", type: "error" });
  }
  const options = {
      method: "GET",
      hostname: "control.msg91.com",
      port: null,
      path: `/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`,
      headers: {
          authkey: process.env.MSG91_AUTH_KEY,
      },
  };
  const reqVerify = http.request(options, (resVerify) => {
      const chunks = [];
      resVerify.on("data", (chunk) => {
          chunks.push(chunk);
      });
      resVerify.on("end", () => {
          const body = Buffer.concat(chunks);
          try {
              const response = JSON.parse(body);
              if (response.type === "success") {
                  sentOtp = null;
                  otpExpiryTime = null;
                  return res
                      .status(200) // Successful OTP verification
                      .json({ message: "OTP verified successfully", type: "success", status : 200 });
              } else {
                  return res
                      .status(400)
                      .json({ message: "Invalid OTP", type: "error" });
              }
          } catch (error) {
              res
                  .status(500)
                  .json({ message: "Failed to parse verification response", error });
          }
      });
  });
  reqVerify.on("error", (error) => {
      // console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Internal server error" });
  });
  reqVerify.end();
};

exports.resendOtp = function (req, res) {
  const { mobile } = req.query;

  if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
  }

  const options = {
      method: "GET",
      hostname: "control.msg91.com",
      port: null,
      path: `/api/v5/otp/retry?authkey=${process.env.MSG91_AUTH_KEY}&retrytype=text&mobile=${mobile}`,
      headers: {},
  };

  const reqRetry = http.request(options, (resRetry) => {
      const chunks = [];

      resRetry.on("data", (chunk) => {
          chunks.push(chunk);
      });

      resRetry.on("end", () => {
          const body = Buffer.concat(chunks);
          try {
              const response = JSON.parse(body);
              if (response.type === "success") {
                  return res
                      .status(200) // Successful OTP resend
                      .json({ message: "OTP resent successfully", type: "success" });
              } else {
                  return res
                      .status(400)
                      .json({ message: "Failed to resend OTP", error: response });
              }
          } catch (error) {
              res
                  .status(500)
                  .json({ message: "Failed to parse resend response", error });
          }
      });
  });

  reqRetry.on("error", (error) => {
      // console.error("Error resending OTP:", error);
      res
          .status(500)
          .json({ message: "Error resending OTP", error: error.message });
  });

  reqRetry.end();
};

