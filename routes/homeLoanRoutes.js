const express = require("express");
const router = express.Router();
const homeLoanController = require("../controllers/homeLoanController");
const upload = require("../utils/upload");
const protect = require("../middleware/generateToken");

router.get(
  "/admin/:adminId/:role/:adminName",
  protect,
  homeLoanController.getHomeLoanByAdminId
);
router.get("/", protect, homeLoanController.getAllHomeLoans);

protect,
  router.post(
    "/",
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
    homeLoanController.createHomeLoan
  );

router.put(
  "/:form_id",
  protect,
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
  homeLoanController.updateHomeLoan
);

router.delete("/:form_id", protect, homeLoanController.deleteHomeLoan);

router.get("/:form_id", protect, homeLoanController.getHomeLoanById);

router.get("/by-email/:email", protect, homeLoanController.getHomeLoanByEmail);

router.get("/loan-status/approved/:adminId/:adminName/:adminRole", protect, homeLoanController.getLoanStatusApprovedCount);

router.get("/loan-status/pending/:adminId/:adminName/:adminRole", protect, homeLoanController.getLoanStatusPendingCount);

router.get("/loan-status/rejected/:adminId/:adminName/:adminRole", protect, homeLoanController.getLoanStatusRejectedCount);

router.get("/loan-status/inprogress/:adminId/:adminName/:adminRole", protect, homeLoanController.getLoanStatusInProgressCount);

router.get("/loan-status/closed/:adminId/:adminName/:adminRole", protect, homeLoanController.getLoanStatusClosedCount);

router.get("/loan-status/unclosed/:adminId/:adminName/:adminRole", protect, homeLoanController.getUnclosedHomeLoan);

router.get(
  "/by-mobile/:mobile",
  protect,
  homeLoanController.getHomeLoanByMobile
);

router.get(
  "/loan-status/approved",
  protect,
  homeLoanController.getLoanStatusApprovedCount
);

router.get(
  "/loan-status/pending",
  protect,
  homeLoanController.getLoanStatusPendingCount
);

router.get(
  "/loan-status/rejected",
  protect,
  homeLoanController.getLoanStatusRejectedCount
);

router.get(
  "/loan-status/inprogress",
  protect,
  homeLoanController.getLoanStatusInProgressCount
);

router.get(
  "/loan-status/closed",
  protect,
  homeLoanController.getLoanStatusClosedCount
);

router.get(
  "/approval/Yes",
  protect,
  homeLoanController.getApprovedHomeLoansYes
);

router.get("/approval/No", protect, homeLoanController.getApprovedHomeLoansNo);

router.get(
  "/approved-loans/:adminId/:adminName/:adminRole",
  protect,
  homeLoanController.getHomeLoanApprovedLoans
);

router.get(
  "/pending-loans/:adminId/:adminName/:adminRole",
  protect,
  homeLoanController.getHomeLoanPendingLoans
);

router.get(
  "/rejected-loans/:adminId/:adminName/:adminRole",
  protect,
  homeLoanController.getHomeLoanRejectLoans
);

router.get(
  "/inprogress-loans/:adminId/:adminName/:adminRole",
  protect,
  homeLoanController.getHomeLoanInProgressLoans
);

router.get(
  "/open-loans/:adminId/:adminName/:adminRole",
  protect,
  homeLoanController.getHomeLoanOpenLoans
);

router.put(
  "/approved-status/:form_id",
  protect,
  homeLoanController.updateApprovedVehicleLoanStatus
);

router.put(
  "/rejected-status/:form_id",
  protect,
  homeLoanController.updateRejectedVehicleLoanStatus
);

router.put(
  "/closed-status/:form_id",
  protect,
  homeLoanController.updateClosedVehicleLoanStatus
);

router.put(
  "/:form_id/update-verification",
  protect,
  homeLoanController.updateHomeLoanVerificationStatus
);

router.put(
  "/:form_id/approval-status",
  protect,
  homeLoanController.updateHomeLoanSendApprovalStatus
);

router.put('/remarks/:form_id', homeLoanController.saveRemarksForVehicleLoanController);


module.exports = router;
