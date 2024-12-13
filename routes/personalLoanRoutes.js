const express = require("express");
const router = express.Router();
const PersonalLoanController = require("../controllers/personalLoanController");
const upload = require("../utils/upload");
const protect = require("../middleware/generateToken");

router.get(
  "/admin/:adminId/:role/:adminName",
  protect,
  PersonalLoanController.getPersonalLoanByAdminId
);

router.get("/", protect, PersonalLoanController.getAllPersonalLoans);


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
    PersonalLoanController.createPersonalLoan
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
  PersonalLoanController.updatePersonalLoan
);

router.delete("/:form_id", protect, PersonalLoanController.deletePersonalLoan);

router.get("/:form_id", protect, PersonalLoanController.getPersonalLoanById);

router.get(
  "/by-email/:email",
  protect,
  PersonalLoanController.getPersonalLoanByEmail
);

router.get(
  "/by-mobile/:mobile",
  protect,
  PersonalLoanController.getPersonalLoanByMobile
);

router.get(
  "/loan-status/approved",
  protect,
  PersonalLoanController.getLoanStatusApprovedCount
);

router.get(
  "/loan-status/pending",
  protect,
  PersonalLoanController.getLoanStatusPendingCount
);

router.get(
  "/loan-status/rejected",
  protect,
  PersonalLoanController.getLoanStatusRejectedCount
);

router.get(
  "/loan-status/inprogress",
  protect,
  PersonalLoanController.getLoanStatusInProgressCount
);

router.get(
  "/loan-status/closed",
  protect,
  PersonalLoanController.getLoanStatusClosedCount
);

router.get(
  "/approval/Yes",
  protect,
  PersonalLoanController.getApprovedPersonalLoansYes
);

router.get(
  "/approval/No",
  protect,
  PersonalLoanController.getApprovedPersonalLoansNo
);

router.get(
  "/approved-loans/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getPersonalLoanApprovedLoans
);

router.get(
  "/pending-loans/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getPersonalLoanPendingLoans
);

router.get(
  "/rejected-loans/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getPersonalLoanRejectLoans
);

router.get(
  "/inprogress-loans/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getPersonalLoanInProgressLoans
);

router.get(
  "/open-loans/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getPersonalLoanOpenLoans
);

router.put(
  "/:form_id/update-verification",
  protect,
  PersonalLoanController.updatePersonalLoanVerificationStatus
);

router.put(
  "/:form_id/approval-status",
  protect,
  PersonalLoanController.updatePersonalLoanSendApprovalStatus
);

router.put(
  "/approved-status/:form_id",
  protect,
  PersonalLoanController.updatePersonalApprovedLoanStatus
);

router.put(
  "/rejected-status/:form_id",
  protect,
  PersonalLoanController.updatePersonalRejectedLoanStatus
);

router.put(
  "/closed-status/:form_id",
  protect,
  PersonalLoanController.updatePersonalClosedLoanStatus
);

router.get(
  "/loan-status/approved/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getLoanStatusApprovedCount
);

router.get(
  "/loan-status/pending/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getLoanStatusPendingCount
);

router.get(
  "/loan-status/rejected/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getLoanStatusRejectedCount
);

router.get(
  "/loan-status/inprogress/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getLoanStatusInProgressCount
);

router.get(
  "/loan-status/closed/:adminId/:adminName/:adminRole",
  protect,
  PersonalLoanController.getLoanStatusClosedCount
);

router.get(
  "/loan-status/unclosed/:adminId/:adminName/:adminRole", 
  protect, 
  PersonalLoanController.getUnclosedPersonalLoan);

  router.put('/remarks/:form_id', PersonalLoanController.saveRemarksForPersonalLoanController);

  
module.exports = router;
