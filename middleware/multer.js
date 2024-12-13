const express = require("express");
const multer = require("multer");
const personalLoanController = require("../controllers/personalLoanController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "aadhar_image", maxCount: 1 },
    { name: "pan_image", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "guarantor_image", maxCount: 1 },
    { name: "guarantor_aadhar_image", maxCount: 1 },
    { name: "guarantor_pan_image", maxCount: 1 },
    { name: "guarantor_signature", maxCount: 1 },
  ]),
  personalLoanController.createPersonalLoan
);

router.get("/", personalLoanController.getAllPersonalLoans);

module.exports = router;
