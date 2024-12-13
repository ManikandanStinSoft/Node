const pool = require("../config/dbConfig");
const PersonalLoanModel = require("../models/personalLoanModel");
const { uploadFileToSpaces } = require("../utils/s3");

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const calculateEMI = (loan_amount_requested, interest_amount, no_emi) => {
  const loanAmount = parseFloat(loan_amount_requested);
  const interestAmount = parseFloat(interest_amount);
  const numberOfEmis = parseInt(no_emi);

  if (numberOfEmis <= 0) {
    return "Invalid tenure";
  }

  const EMI = (loanAmount + interestAmount) / numberOfEmis;
  return EMI.toFixed(0);
};

const createPersonalLoan = async (req, res) => {
  try {
    const files = req.files || {};

    const dob = req.body.date_of_birth;
    const guarantorDob = req.body.guarantor_date_of_birth;

    const age = calculateAge(dob);
    const guarantorAge = calculateAge(guarantorDob);

    const loanAmountRequested = req.body.loan_amount_requested;
    const interestAmount = req.body.interest_amount;
    const noEmi = req.body.no_emi;

    const emiAmount = calculateEMI(loanAmountRequested, interestAmount, noEmi);

    const loanData = {
      is_verified: req.body.is_verified || "none",
      created_employee_name: req.body.created_employee_name,
      created_employee_id: req.body.created_employee_id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      date_of_birth: req.body.date_of_birth,
      age: age,
      mobile: req.body.mobile,
      alternate_mobile: req.body.alternate_mobile,
      email: req.body.email,
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      aadhar_number: req.body.aadhar_number,
      pan_number: req.body.pan_number,
      loan_amount_requested: loanAmountRequested,
      approved_loan_amount: req.body.approved_loan_amount,
      emi_schedule: req.body.emi_schedule,
      no_emi: noEmi,
      interest_amount: interestAmount,
      emi_amount: emiAmount,
      loan_id: req.body.loan_id,
      other_charges: req.body.other_charges,
      loan_status: req.body.loan_status,
      rejected_reason: req.body.rejected_reason,
      guarantor_firstname: req.body.guarantor_firstname,
      guarantor_lastname: req.body.guarantor_lastname,
      guarantor_gender: req.body.guarantor_gender,
      guarantor_date_of_birth: req.body.guarantor_date_of_birth,
      guarantor_age: guarantorAge,
      guarantor_mobile: req.body.guarantor_mobile,
      guarantor_alternate_mobile: req.body.guarantor_alternate_mobile,
      guarantor_email: req.body.guarantor_email,
      guarantor_address1: req.body.guarantor_address1,
      guarantor_address2: req.body.guarantor_address2,
      guarantor_state: req.body.guarantor_state,
      guarantor_city: req.body.guarantor_city,
      guarantor_pincode: req.body.guarantor_pincode,
      guarantor_aadhar_number: req.body.guarantor_aadhar_number,
      guarantor_pan_number: req.body.guarantor_pan_number,
      apply_for_loan_user: req.body.apply_for_loan_user || "No",
      mark_as_read_by_user: req.body.mark_as_read_by_user || "No",
      send_to_employee: req.body.send_to_employee || "No",
      send_to_employee_date: req.body.send_to_employee_date || null,
      send_approval: req.body.send_approval || "No",
      send_approval_date: req.body.send_approval_date || null,
      mark_as_read_employee: req.body.mark_as_read_employee || "No",
      remarks: req.body.remarks || null,
      is_rejected: req.body.is_rejected || "No",
      rejected_reason: req.body.rejected_reason || null,
      approval_date: req.body.approval_date || null,
      rejected_date: req.body.rejected_date || null,
      mark_as_read_admin: req.body.mark_as_read_admin || "No",
      rejected_reason_admin: req.body.rejected_reason_admin || "No",
      approval_date_admin: req.body.approval_date_admin || null,
      rejected_date_admin: req.body.rejected_date_admin || null,
      assigned_to: req.body.assigned_to,
      image: null,
      aadhar_image: null,
      pan_image: null,
      signature: null,
      guarantor_image: null,
      guarantor_aadhar_image: null,
      guarantor_pan_image: null,
      guarantor_signature: null,
    };

    const checkQuery = `SELECT COUNT(*) AS count FROM PersonalLoan WHERE email = ? OR mobile = ?`;
    const [[checkResult]] = await pool.query(checkQuery, [
      loanData.email,
      loanData.mobile,
    ]);
    if (checkResult.count > 0) {
      return res
        .status(400)
        .json({ message: "Email or Mobile number already exists" });
    }

    const insertQuery = `
    INSERT INTO PersonalLoan (
  is_verified, created_employee_name,created_employee_id, firstname, lastname, gender, date_of_birth, age, mobile, alternate_mobile,
  email, address_1, address_2, city, state, pincode, aadhar_number, pan_number,
        loan_amount_requested, approved_loan_amount, emi_schedule, no_emi, interest_amount, emi_amount,
        loan_id, other_charges, loan_status, rejected_reason, guarantor_firstname, guarantor_lastname,
  guarantor_gender, guarantor_date_of_birth,guarantor_age, guarantor_mobile, guarantor_alternate_mobile, guarantor_email,
  guarantor_address1, guarantor_address2, guarantor_state, guarantor_city, guarantor_pincode,
  guarantor_aadhar_number, guarantor_pan_number, apply_for_loan_user, mark_as_read_by_user, send_to_employee, send_to_employee_date,
  send_approval, send_approval_date, mark_as_read_employee, remarks, is_rejected,
  approval_date, rejected_date, mark_as_read_admin, rejected_reason_admin,
  approval_date_admin, rejected_date_admin, assigned_to, image, aadhar_image, pan_image, signature,
  guarantor_image, guarantor_aadhar_image, guarantor_pan_image, guarantor_signature
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = Object.values(loanData);
    const [result] = await pool.query(insertQuery, values);
    const loanId = result.insertId;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(2);
    const formId = `PL${day}${month}${year}${loanId}`;

    const updateQuery = `
      UPDATE PersonalLoan SET form_id = ? WHERE id = ?`;
    await pool.query(updateQuery, [formId, loanId]);

    loanData.form_id = loanId;
    const folderPath = `Finance/PersonalLoan/${formId}`;

    if (files.image) {
      loanData.image = await uploadFileToSpaces(
        files.image[0],
        `${folderPath}/Image`
      );
    }
    if (files.aadhar_image) {
      loanData.aadhar_image = await uploadFileToSpaces(
        files.aadhar_image[0],
        `${folderPath}/Aadhar`
      );
    }
    if (files.pan_image) {
      loanData.pan_image = await uploadFileToSpaces(
        files.pan_image[0],
        `${folderPath}/Pan`
      );
    }
    if (files.signature) {
      loanData.signature = await uploadFileToSpaces(
        files.signature[0],
        `${folderPath}/Signature`
      );
    }
    if (files.guarantor_image) {
      loanData.guarantor_image = await uploadFileToSpaces(
        files.guarantor_image[0],
        `${folderPath}/GuarantorImage`
      );
    }
    if (files.guarantor_aadhar_image) {
      loanData.guarantor_aadhar_image = await uploadFileToSpaces(
        files.guarantor_aadhar_image[0],
        `${folderPath}/GuarantorAadharImage`
      );
      if (files.guarantor_pan_image) {
        loanData.guarantor_pan_image = await uploadFileToSpaces(
          files.guarantor_pan_image[0],
          `${folderPath}/GuarantorPanImage`
        );
      }
      if (files.guarantor_signature) {
        loanData.guarantor_signature = await uploadFileToSpaces(
          files.guarantor_signature[0],
          `${folderPath}/GuarantorSignature`
        );
      }

      const updateFilesQuery = `
      UPDATE PersonalLoan SET 
        image = ?, aadhar_image = ?, pan_image = ?, signature = ?, 
        guarantor_image = ?, guarantor_aadhar_image = ?, guarantor_pan_image = ?, guarantor_signature = ?
      WHERE form_id = ?
    `;
    
    const updateFilesValues = [
      loanData.image || null,
      loanData.aadhar_image || null,
      loanData.pan_image || null,
      loanData.signature || null,
      loanData.guarantor_image || null,
      loanData.guarantor_aadhar_image || null,
      loanData.guarantor_pan_image || null,
      loanData.guarantor_signature || null,  
      formId,
    ];
    
    await pool.query(updateFilesQuery, updateFilesValues);
    
    }
    res.status(201).json({
      message: "Personal loan created successfully",
      loanId: loanId,
    });
  } catch (error) {
    console.error("Error creating personal loan:", error);
    res
      .status(500)
      .json({ message: "Error creating personal loan", error: error.message });
  }
};

const updatePersonalLoan = async (req, res) => {
  try {
    const { form_id: loanId } = req.params;
    const files = req.files || {};
    const [existingData] = await pool.query(
      `SELECT * FROM PersonalLoan WHERE form_id = ?`,
      [loanId]
    );
    if (!existingData.length) {
      return res.status(404).json({ message: "Loan record not found" });
    }
    const currentLoanData = existingData[0];
    const borrowerDob = req.body.date_of_birth;
    const guarantorDob = req.body.guarantor_date_of_birth;
    const borrowerAge = borrowerDob ? calculateAge(borrowerDob) : null;
    const guarantorAge = guarantorDob ? calculateAge(guarantorDob) : null;
    const approvedLoanAmount = parseFloat(req.body.approved_loan_amount) || 0;
    const interestAmount = parseFloat(req.body.interest_amount) || 0;
    const numberOfEmis = parseInt(req.body.no_emi) || 1;
    const emiSchedule = req.body.emi_schedule;
    const emiAmount = (approvedLoanAmount + interestAmount) / numberOfEmis;
    let roundEmi;
    if (emiSchedule === "Weekly" || emiSchedule === "Daily") {
      roundEmi = Math.round(emiAmount / 10) * 10;
    }
    if (emiSchedule === "Monthly") {
      const remainder = emiAmount % 100;
      if (remainder >= 1 && remainder <= 50) {
        roundEmi = Math.round(emiAmount / 50) * 50;
      } else {
        roundEmi = Math.round(emiAmount / 100) * 100;
      }
    }
    const loanData = {
      ...currentLoanData,
      is_verified: req.body.is_verified || currentLoanData.is_verified,
      created_employee_name:
        req.body.created_employee_name || currentLoanData.created_employee_name,
      created_employee_id:
        req.body.created_employee_id || currentLoanData.created_employee_id,
      firstname: req.body.firstname || currentLoanData.firstname,
      lastname: req.body.lastname || currentLoanData.lastname,
      gender: req.body.gender || currentLoanData.gender,
      date_of_birth: borrowerDob || currentLoanData.date_of_birth,
      age: borrowerAge || currentLoanData.age,
      mobile: req.body.mobile || currentLoanData.mobile,
      alternate_mobile:
        req.body.alternate_mobile || currentLoanData.alternate_mobile,
      email: req.body.email || currentLoanData.email,
      address_1: req.body.address_1 || currentLoanData.address_1,
      address_2: req.body.address_2 || currentLoanData.address_2,
      city: req.body.city || currentLoanData.city,
      state: req.body.state || currentLoanData.state,
      pincode: req.body.pincode || currentLoanData.pincode,
      aadhar_number: req.body.aadhar_number || currentLoanData.aadhar_number,
      pan_number: req.body.pan_number || currentLoanData.pan_number,
      loan_amount_requested:
        parseFloat(req.body.loan_amount_requested) ||
        currentLoanData.loan_amount_requested,
      approved_loan_amount: approvedLoanAmount,
      rounded_emi:roundEmi,
      emi_schedule: req.body.emi_schedule || currentLoanData.emi_schedule,
      no_emi: numberOfEmis,
      interest_amount: interestAmount,
      emi_amount: emiAmount,
      loan_id: req.body.loan_id || currentLoanData.loan_id,
      other_charges: req.body.other_charges || currentLoanData.other_charges,
      loan_status: req.body.loan_status || currentLoanData.loan_status,
      rejected_reason:
        req.body.rejected_reason || currentLoanData.rejected_reason,
      assigned_to: req.body.assigned_to || currentLoanData.assigned_to,
      guarantor_firstname:
        req.body.guarantor_firstname || currentLoanData.guarantor_firstname,
      guarantor_lastname:
        req.body.guarantor_lastname || currentLoanData.guarantor_lastname,
      guarantor_gender:
        req.body.guarantor_gender || currentLoanData.guarantor_gender,
      guarantor_date_of_birth:
        guarantorDob || currentLoanData.guarantor_date_of_birth,
      guarantor_age: guarantorAge || currentLoanData.guarantor_age,
      guarantor_mobile:
        req.body.guarantor_mobile || currentLoanData.guarantor_mobile,
      guarantor_alternate_mobile:
        req.body.guarantor_alternate_mobile ||
        currentLoanData.guarantor_alternate_mobile,
      guarantor_email:
        req.body.guarantor_email || currentLoanData.guarantor_email,
      guarantor_address1:
        req.body.guarantor_address1 || currentLoanData.guarantor_address1,
      guarantor_address2:
        req.body.guarantor_address2 || currentLoanData.guarantor_address2,
      guarantor_state:
        req.body.guarantor_state || currentLoanData.guarantor_state,
      guarantor_city: req.body.guarantor_city || currentLoanData.guarantor_city,
      guarantor_pincode:
        req.body.guarantor_pincode || currentLoanData.guarantor_pincode,
      guarantor_aadhar_number:
        req.body.guarantor_aadhar_number ||
        currentLoanData.guarantor_aadhar_number,
      guarantor_pan_number:
        req.body.guarantor_pan_number || currentLoanData.guarantor_pan_number,
      image: currentLoanData.image,
      aadhar_image: currentLoanData.aadhar_image,
      pan_image: currentLoanData.pan_image,
      signature: currentLoanData.signature,
      guarantor_image: currentLoanData.guarantor_image,
      guarantor_aadhar_image: currentLoanData.guarantor_aadhar_image,
      guarantor_pan_image: currentLoanData.guarantor_pan_image,
      guarantor_signature: currentLoanData.guarantor_signature,
    };
    const folderPath = `Finance/PersonalLoan/${loanId}`;
    try {
      if (files.image) {
        loanData.image = await uploadFileToSpaces(
          files.image[0],
          `${folderPath}/Image`
        );
      }
      if (files.aadhar_image) {
        loanData.aadhar_image = await uploadFileToSpaces(
          files.aadhar_image[0],
          `${folderPath}/Aadhar`
        );
      }
      if (files.pan_image) {
        loanData.pan_image = await uploadFileToSpaces(
          files.pan_image[0],
          `${folderPath}/Pan`
        );
      }
      if (files.signature) {
        loanData.signature = await uploadFileToSpaces(
          files.signature[0],
          `${folderPath}/Signature`
        );
      }
      if (files.guarantor_image) {
        loanData.guarantor_image = await uploadFileToSpaces(
          files.guarantor_image[0],
          `${folderPath}/GuarantorImage`
        );
      }
      if (files.guarantor_aadhar_image) {
        loanData.guarantor_aadhar_image = await uploadFileToSpaces(
          files.guarantor_aadhar_image[0],
          `${folderPath}/GuarantorAadhar`
        );
      }
      if (files.guarantor_pan_image) {
        loanData.guarantor_pan_image = await uploadFileToSpaces(
          files.guarantor_pan_image[0],
          `${folderPath}/GuarantorPan`
        );
      }
      if (files.guarantor_signature) {
        loanData.guarantor_signature = await uploadFileToSpaces(
          files.guarantor_signature[0],
          `${folderPath}/GuarantorSignature`
        );
      }
    } catch (uploadError) {
      return res
        .status(500)
        .json({ message: "Error uploading files", error: uploadError.message });
    }
    const checkQuery = `SELECT COUNT(*) AS count FROM PersonalLoan WHERE (email = ? OR mobile = ?) AND form_id != ?`;
    const [[checkResult]] = await pool.query(checkQuery, [
      loanData.mobile,
      loanData.email,
      loanId,
    ]);
    if (checkResult.count > 0) {
      return res
        .status(400)
        .json({ message: "Mobile or email already exists for another record" });
    }
    const updateQuery = `
      UPDATE PersonalLoan SET
        is_verified = ?, created_employee_name = ?, created_employee_id = ?, firstname = ?, lastname = ?, gender = ?,
        date_of_birth = ?, age = ?, mobile = ?, alternate_mobile = ?, email = ?,
        address_1 = ?, address_2 = ?, city = ?, state = ?, pincode = ?,
        aadhar_number = ?, pan_number = ?, loan_amount_requested = ?,
        approved_loan_amount = ?,rounded_emi = ?, emi_schedule = ?, no_emi = ?, interest_amount = ?,
        emi_amount = ?, loan_id = ?, other_charges = ?, loan_status = ?,
        rejected_reason = ?, assigned_to = ?, guarantor_firstname = ?, guarantor_lastname = ?,
        guarantor_gender = ?, guarantor_date_of_birth = ?, guarantor_age = ?,
        guarantor_mobile = ?, guarantor_alternate_mobile = ?, guarantor_email = ?,
        guarantor_address1 = ?, guarantor_address2 = ?, guarantor_state = ?,
        guarantor_city = ?, guarantor_pincode = ?, guarantor_aadhar_number = ?,
        guarantor_pan_number = ?, apply_for_loan_user = ?, mark_as_read_by_user = ?,
        send_to_employee = ?, send_to_employee_date = ?, send_approval = ?,
        send_approval_date = ?, mark_as_read_employee = ?, remarks = ?,
        is_rejected = ?, approval_date = ?, rejected_date = ?, mark_as_read_admin = ?,
        rejected_reason_admin = ?, approval_date_admin = ?, rejected_date_admin = ?,
        image = ?, aadhar_image = ?, pan_image = ?, signature = ?, guarantor_image = ?,
        guarantor_aadhar_image = ?, guarantor_pan_image = ?, guarantor_signature = ?
      WHERE form_id = ?
    `;
    const values = [
      loanData.is_verified,
      loanData.created_employee_name,
      loanData.created_employee_id,
      loanData.firstname,
      loanData.lastname,
      loanData.gender,
      loanData.date_of_birth,
      loanData.age,
      loanData.mobile,
      loanData.alternate_mobile,
      loanData.email,
      loanData.address_1,
      loanData.address_2,
      loanData.city,
      loanData.state,
      loanData.pincode,
      loanData.aadhar_number,
      loanData.pan_number,
      loanData.loan_amount_requested,
      loanData.approved_loan_amount,
      loanData.rounded_emi,
      loanData.emi_schedule,
      loanData.no_emi,
      loanData.interest_amount,
      loanData.emi_amount,
      loanData.loan_id,
      loanData.other_charges,
      loanData.loan_status,
      loanData.rejected_reason,
      loanData.assigned_to,
      loanData.guarantor_firstname,
      loanData.guarantor_lastname,
      loanData.guarantor_gender,
      loanData.guarantor_date_of_birth,
      loanData.guarantor_age,
      loanData.guarantor_mobile,
      loanData.guarantor_alternate_mobile,
      loanData.guarantor_email,
      loanData.guarantor_address1,
      loanData.guarantor_address2,
      loanData.guarantor_state,
      loanData.guarantor_city,
      loanData.guarantor_pincode,
      loanData.guarantor_aadhar_number,
      loanData.guarantor_pan_number,
      loanData.apply_for_loan_user,
      loanData.mark_as_read_by_user,
      loanData.send_to_employee,
      loanData.send_to_employee_date,
      loanData.send_approval,
      loanData.send_approval_date,
      loanData.mark_as_read_employee,
      loanData.remarks,
      loanData.is_rejected,
      loanData.approval_date,
      loanData.rejected_date,
      loanData.mark_as_read_admin,
      loanData.rejected_reason_admin,
      loanData.approval_date_admin,
      loanData.rejected_date_admin,
      loanData.image,
      loanData.aadhar_image,
      loanData.pan_image,
      loanData.signature,
      loanData.guarantor_image,
      loanData.guarantor_aadhar_image,
      loanData.guarantor_pan_image,
      loanData.guarantor_signature,
      loanId,
    ];
    await pool.query(updateQuery, values);
    res.status(200).json({ message: "Personal Loan updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Personal Loan", error });
  }
};

const deletePersonalLoan = async (req, res) => {
  try {
    const loanId = req.params.form_id;
    const query = "DELETE FROM PersonalLoan WHERE form_id = ?";
    const [result] = await pool.query(query, [loanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PersonalLoan record not found" });
    }

    res
      .status(200)
      .json({ message: "PersonalLoan record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting PersonalLoan record",
      error: error.message,
    });
  }
};

const getAllPersonalLoans = async (req, res) => {
  try {
    const query = "SELECT * FROM PersonalLoan";
    const [results] = await pool.query(query);

    const generatePresignedUrl = async (loan, field) => {
      if (!loan[field]) return null;
      const link = loan[field];
      const fileName = link.split("/").pop();
      const pathParts = link.split("/");
      const filePath = `${pathParts.slice(3, -1).join("/")}/`;
      return `${req.protocol}://${req.get(
        "host"
      )}/fetch-image?filePath=${encodeURIComponent(
        filePath
      )}&fileName=${encodeURIComponent(fileName)}`;
    };

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    const resultsWithUrls = await Promise.all(
      results.map(async (loan) => ({
        ...loan,
        date_of_birth: formatDate(loan.date_of_birth),
        guarantor_date_of_birth: formatDate(loan.guarantor_date_of_birth),
        image: await generatePresignedUrl(loan, "image"),
        aadhar_image: await generatePresignedUrl(loan, "aadhar_image"),
        pan_image: await generatePresignedUrl(loan, "pan_image"),
        signature: await generatePresignedUrl(loan, "signature"),
        guarantor_image: await generatePresignedUrl(loan, "guarantor_image"),
        guarantor_aadhar_image: await generatePresignedUrl(
          loan,
          "guarantor_aadhar_image"
        ),
        guarantor_pan_image: await generatePresignedUrl(
          loan,
          "guarantor_pan_image"
        ),
        guarantor_signature: await generatePresignedUrl(
          loan,
          "guarantor_signature"
        ),
      }))
    );

    res.status(200).json(resultsWithUrls);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching PersonalLoan records",
      error: error.message,
    });
  }
};

const getPersonalLoanById = async (req, res) => {
  const { form_id } = req.params;

  try {
    const query = "SELECT * FROM PersonalLoan WHERE form_id = ?";
    const [[loan]] = await pool.query(query, [form_id]);

    if (!loan) {
      return res.status(404).json({ message: "PersonalLoan not found" });
    }

    const generatePresignedUrl = async (field) => {
      if (!loan[field]) return null;
      const link = loan[field];
      const fileName = link.split("/").pop();
      const pathParts = link.split("/");
      const filePath = `${pathParts.slice(3, -1).join("/")}/`;
      return `${req.protocol}://${req.get(
        "host"
      )}/fetch-image?filePath=${encodeURIComponent(
        filePath
      )}&fileName=${encodeURIComponent(fileName)}`;
    };

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    const result = {
      ...loan,
      date_of_birth: formatDate(loan.date_of_birth),
      guarantor_date_of_birth: formatDate(loan.guarantor_date_of_birth),
      image: await generatePresignedUrl("image"),
      aadhar_image: await generatePresignedUrl("aadhar_image"),
      pan_image: await generatePresignedUrl("pan_image"),
      signature: await generatePresignedUrl("signature"),
      guarantor_image: await generatePresignedUrl("guarantor_image"),
      guarantor_aadhar_image: await generatePresignedUrl(
        "guarantor_aadhar_image"
      ),
      guarantor_pan_image: await generatePresignedUrl("guarantor_pan_image"),
      guarantor_signature: await generatePresignedUrl("guarantor_signature"),
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching PersonalLoan by ID",
      error: error.message,
    });
  }
};

const getPersonalLoanByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const query = "SELECT * FROM PersonalLoan WHERE email = ?";
    const [results] = await pool.query(query, [email]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No PersonalLoan found for this email" });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching PersonalLoan by email",
      error: error.message,
    });
  }
};

const getPersonalLoanByMobile = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    const query = "SELECT * FROM PersonalLoan WHERE mobile = ?";
    const [results] = await pool.query(query, [mobile]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No PersonalLoan found for this mobile number" });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching PersonalLoan by mobile",
      error: error.message,
    });
  }
};

const getPersonalLoanByAdminId = async (req, res) => {
  const { adminId, adminName } = req.params;
  try {
    const loans = await PersonalLoanModel.getPersonalLoanByAdminId(
      adminId,
      adminName
    );
    res.status(200).json(loans);
  } catch (err) {
    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }
    res.status(500).json({
      message: "Error fetching PersonalLoan by admin ID",
      error: err.message,
    });
  }
};

const getLoanStatusApprovedCount = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    const approvedLoans = await PersonalLoanModel.getLoanStatusApprovedCount(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );
    const approvedLoanCount = approvedLoans.length;

    return res.status(200).json({
      status: "success",
      data: {
        approvedLoanCount,
        approvedLoans,
      },
    });
  } catch (error) {
    console.error("Error in getLoanStatusApprovedCount:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getLoanStatusPendingCount = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    const pendingLoans = await PersonalLoanModel.getLoanStatusPendingCount(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );
    const pendingLoanCount = pendingLoans.length;

    return res.status(200).json({
      status: "success",
      data: {
        pendingLoanCount,
        pendingLoans,
      },
    });
  } catch (error) {
    console.error("Error in getLoanStatusApprovedCount:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getLoanStatusRejectedCount = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    const rejectedLoans = await PersonalLoanModel.getLoanStatusRejectedCount(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );
    const rejectedLoancount = rejectedLoans.length;

    return res.status(200).json({
      status: "success",
      data: {
        rejectedLoancount,
        rejectedLoans,
      },
    });
  } catch (error) {
    console.error("Error in getLoanStatusApprovedCount:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getLoanStatusInProgressCount = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    const inProgressLoans =
      await PersonalLoanModel.getLoanStatusInProgressCount(
        adminId.trim(),
        adminName.trim(),
        adminRole.trim()
      );
    const inProgressLoanCount = inProgressLoans.length;

    return res.status(200).json({
      status: "success",
      data: {
        inProgressLoanCount,
        inProgressLoans,
      },
    });
  } catch (error) {
    console.error("Error in getLoanStatusApprovedCount:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getLoanStatusClosedCount = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    const closedLoans = await PersonalLoanModel.getLoanStatusClosedCount(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );
    const closedLoansCount = closedLoans.length;

    return res.status(200).json({
      status: "success",
      data: {
        closedLoansCount,
        closedLoans,
      },
    });
  } catch (error) {
    console.error("Error in getLoanStatusApprovedCount:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getApprovedPersonalLoansYes = async (req, res) => {
  try {
    const query = "SELECT * FROM PersonalLoan WHERE send_approval = 'Yes'";
    const [results] = await pool.query(query);

    if (results.length === 0) {
      return res.status(404).json({
        message: "No Personal Loans found with approval status 'Yes'.",
      });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching Personal Loans with 'Yes' approval:", error);
    res.status(500).json({
      message: "Error fetching Personal Loans with 'Yes' approval status.",
      error: error.message,
    });
  }
};

const getApprovedPersonalLoansNo = async (req, res) => {
  try {
    const query = "SELECT * FROM PersonalLoan WHERE send_approval = 'No'";
    const [results] = await pool.query(query);

    if (results.length === 0) {
      return res.status(404).json({
        message: "No Personal Loans found with approval status 'No'.",
      });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching Personal Loans with 'No' approval:", error);
    res.status(500).json({
      message: "Error fetching Personal Loans with 'No' approval status.",
      error: error.message,
    });
  }
};

const getPersonalLoanApprovedLoans = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;

  try {
    const loans = await PersonalLoanModel.getPersonalLoanByApprovedLoanStatus(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );

    if (loans.length === 0) {
      console.warn("No loans found for the given admin details.");
    }

    res.status(200).json({
      message: "success",
      data: loans,
    });
  } catch (err) {
    console.error("Error fetching pending loans:", err.message);

    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(500).json({
      message: "Error fetching Personal Loan by loan status",
      error: err.message,
    });
  }
};

const getPersonalLoanPendingLoans = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;

  try {
    const loans = await PersonalLoanModel.getPersonalLoanByPendingLoanStatus(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );

    if (loans.length === 0) {
      console.warn("No loans found for the given admin details.");
    }

    res.status(200).json({
      message: "success",
      data: loans,
    });
  } catch (err) {
    console.error("Error fetching pending loans:", err.message);

    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(500).json({
      message: "Error fetching Personal Loan by loan status",
      error: err.message,
    });
  }
};

const getPersonalLoanRejectLoans = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;

  try {
    const loans = await PersonalLoanModel.getPersonalLoanByRejectLoanStatus(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );

    if (loans.length === 0) {
      console.warn("No loans found for the given admin details.");
    }

    res.status(200).json({
      message: "success",
      data: loans,
    });
  } catch (err) {
    console.error("Error fetching pending loans:", err.message);

    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(500).json({
      message: "Error fetching Personal Loan by loan status",
      error: err.message,
    });
  }
};

const getPersonalLoanInProgressLoans = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;

  try {
    const loans = await PersonalLoanModel.getPersonalLoanByInProgressLoanStatus(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );

    if (loans.length === 0) {
      console.warn("No loans found for the given admin details.");
    }

    res.status(200).json({
      message: "success",
      data: loans,
    });
  } catch (err) {
    console.error("Error fetching pending loans:", err.message);

    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(500).json({
      message: "Error fetching Personal Loan by loan status",
      error: err.message,
    });
  }
};

const getPersonalLoanOpenLoans = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;

  try {
    const loans = await PersonalLoanModel.getPersonalLoanByOpenLoanStatus(
      adminId.trim(),
      adminName.trim(),
      adminRole.trim()
    );

    if (loans.length === 0) {
      console.warn("No loans found for the given admin details.");
    }

    res.status(200).json({
      message: "success",
      data: loans,
    });
  } catch (err) {
    console.error("Error fetching pending loans:", err.message);

    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(500).json({
      message: "Error fetching Personal Loan by loan status",
      error: err.message,
    });
  }
};

const updatePersonalLoanVerificationStatus = async (req, res) => {
    try {
      const loanId = req.params.form_id;
      const { 
        is_verified, 
        approved_loan_amount: approvedLoanAmount, 
        loan_id, 
        other_charges 
      } = req.body;
  
      if (!loan_id || !approvedLoanAmount || !other_charges) {
        return res.status(400).json({
          message: "Please provide loan ID, approved loan amount, and other charges."
        });
      }
  
      if (!["verified", "reject"].includes(is_verified)) {
        console.log("Invalid verification status:", is_verified);
        return res.status(400).json({ message: "Invalid verification status" });
      }
  
      if (approvedLoanAmount && isNaN(approvedLoanAmount)) {
        return res.status(400).json({ message: "`approved_loan_amount` must be a valid number" });
      }
  
      const updateData = {
        is_verified,
        approvedLoanAmount: approvedLoanAmount,
        loan_id: loan_id,
        other_charges: other_charges,
      };
  
      const result = await PersonalLoanModel.updateLoanVerificationStatus(loanId, updateData);
  
      console.log("Loan updated successfully:", { loanId, updateData });
  
      return res.status(200).json({
        message: "Loan updated successfully",
        loanId,
        updateData,
      });
    } catch (err) {
      console.error("Error updating loan:", err);
      return res.status(500).json({
        message: "Error updating loan",
        error: err.message,
      });
    }
  };
  
const updatePersonalLoanSendApprovalStatus = async (req, res) => {
  try {
    const loanId = req.params.form_id;
    const { send_approval } = req.body;

    if (!["Yes", "No"].includes(send_approval)) {
      console.log("Invalid approval status:", send_approval);
      return res.status(400).json({ message: "Invalid approval status" });
    }

    let send_approval_date = null;
    if (send_approval === "Yes") {
      const now = new Date();
      send_approval_date = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}`;
    }

    const approvalData = {
      send_approval,
      send_approval_date,
    };

    const updateQuery = `
      UPDATE PersonalLoan SET 
        send_approval = ?, 
        send_approval_date = ? 
      WHERE form_id = ?
    `;

    const values = [
      approvalData.send_approval,
      approvalData.send_approval_date,
      loanId,
    ];

    console.log("Executing query:", updateQuery);
    console.log("Query values:", values);

    await pool.query(updateQuery, values);

    console.log("Approval status updated successfully:", approvalData);

    return res.status(200).json({
      message: "Approval status updated successfully",
      approvalData,
      loanId,
    });
  } catch (err) {
    console.error("Error updating approval status:", err);
    return res
      .status(500)
      .json({ message: "Error updating approval status", error: err.message });
  }
};

const updatePersonalApprovedLoanStatus = async (req, res) => {
  console.log("Request received for form ID:", req.params.form_id);
  console.log("Request body:", req.body);

  try {
    const loanId = req.params.form_id;
    const { loan_status } = req.body;

    const result = await PersonalLoanModel.updateApprovedPersonalLoanStatus(
      loanId,
      loan_status
    );

    return res.status(200).json({
      message: "Loan status updated successfully",
      loanId: loanId,
      updatedStatus: loan_status,
    });
  } catch (err) {
    console.error("Error in controller:", err);
    return res.status(500).json({
      message: "Error updating loan status",
      error: err.message,
    });
  }
};

const updatePersonalRejectedLoanStatus = async (req, res) => {
  console.log("Request received for form ID:", req.params.form_id);
  console.log("Request body:", req.body);

  try {
    const loanId = req.params.form_id;
    const { loan_status } = req.body;

    if (!loan_status) {
      return res.status(400).json({ message: "Loan status is required" });
    }

    const result = await PersonalLoanModel.updateRejectedPersonalLoanStatus(
      loanId,
      loan_status
    );

    return res.status(200).json({
      message: "Loan status updated successfully",
      loanId: loanId,
      updatedStatus: loan_status,
    });
  } catch (err) {
    console.error("Error in controller:", err);
    return res.status(500).json({
      message: "Error updating loan status",
      error: err.message,
    });
  }
};

const updatePersonalClosedLoanStatus = async (req, res) => {
  console.log("Request received for form ID:", req.params.form_id);
  console.log("Request body:", req.body);

  try {
    const loanId = req.params.form_id;
    const { loan_status } = req.body;

    const result = await PersonalLoanModel.updateClosedPersonalLoanStatus(
      loanId,
      loan_status
    );

    return res.status(200).json({
      message: "Loan status updated successfully",
      loanId: loanId,
      updatedStatus: loan_status,
    });
  } catch (err) {
    console.error("Error in controller:", err);
    return res.status(500).json({
      message: "Error updating loan status",
      error: err.message,
    });
  }
};

const getUnclosedPersonalLoan = async (req, res) => {
  const { adminId, adminName, adminRole } = req.params;
  try {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }

    const adminQuery = `
      SELECT * FROM ADMIN
      WHERE id = ?
        AND name = ?
        AND role = ?
    `;
    const adminParams = [adminId, adminName, adminRole];
    const [adminResult] = await pool.query(adminQuery, adminParams);
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }

    console.log("Admin Details Verified:");

    const scheduleQuery = `
      SELECT form_id
      FROM ScheduleEmi
      WHERE paid_status = 'Paid'
        AND remaining_balance = 0
    `;
    const [scheduleResults] = await pool.query(scheduleQuery);
    if (scheduleResults.length === 0) {
      console.warn("No closed records found in the Schedule table.");
      return res.status(200).json({
        message: "success",
        data: [],
      });
    }

    const formIds = scheduleResults.map((record) => record.form_id);
    console.log("Form IDs with zero remaining_balance:");
    console.log(formIds);

    const personalLoanQuery = `
      SELECT * FROM PersonalLoan
      WHERE form_id IN (?)
    `;
    const [personalLoanResults] = await pool.query(personalLoanQuery, [formIds]);

    console.log("Query Result for Personal Loans:");
    console.log(personalLoanResults);

    res.status(200).json({
      message: "success",
      data: personalLoanResults,
    });
  } catch (err) {
    console.error("Error fetching closed personal loan records:", err.message);
    if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    } else if (err.message === "Admin details are incorrect") {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(500).json({
      message: "Error fetching closed personal loan records",
      error: err.message,
    });
  }
};

const saveRemarksForPersonalLoanController = async (req, res) => {
  console.log("Request received to save remarks for loan ID:", req.params.form_id);
  console.log("Request body:", req.body);
  try {
    const loanId = req.params.form_id;
    const { remarks } = req.body;
    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({
        message: "Remarks are required",
      });
    }
    const result = await PersonalLoanModel.saveRemarksForPersonalLoan(loanId, remarks);
    return res.status(200).json({
      message: "Remarks saved successfully",
      loanId: loanId,
    });
  } catch (err) {
    console.error("Error in controller:", err);
    return res.status(500).json({
      message: "Error saving remarks",
      error: err.message,
    });
  }
};


module.exports = {
  createPersonalLoan,
  updatePersonalLoan,
  deletePersonalLoan,
  getAllPersonalLoans,
  getPersonalLoanById,
  getPersonalLoanByEmail,
  getPersonalLoanByMobile,
  getPersonalLoanByAdminId,
  getLoanStatusApprovedCount,
  getLoanStatusPendingCount,
  getLoanStatusRejectedCount,
  getLoanStatusInProgressCount,
  getLoanStatusClosedCount,
  getApprovedPersonalLoansYes,
  getApprovedPersonalLoansNo,
  getPersonalLoanApprovedLoans,
  getPersonalLoanPendingLoans,
  getPersonalLoanRejectLoans,
  getPersonalLoanInProgressLoans,
  getPersonalLoanOpenLoans,
  updatePersonalLoanVerificationStatus,
  updatePersonalLoanSendApprovalStatus,
  updatePersonalApprovedLoanStatus,
  updatePersonalRejectedLoanStatus,
  updatePersonalClosedLoanStatus,
  getUnclosedPersonalLoan,
  saveRemarksForPersonalLoanController,
  updatePersonalLoanVerificationStatus
};
