const pool =require("../config/dbConfig");
const {uploadFileToSpaces} =require("../utils/s3");
const ScheduleEmiModel = require("../models/scheduleEmiModel");

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const createScheduleEmi = async (req, res) => {
  try {
    const files = req.files || {};

    const loanData = {
      principal_loan_amount: req.body.principal_loan_amount || null,
      annual_interest: req.body.annual_interest || null,
      manual_interest: req.body.manual_interest || null,
      monthly_interest_amount: req.body.monthly_interest_amount || null,
      manual_interest_rate: req.body.manual_interest_rate || null,
      balance_need_to_pay: req.body.balance_need_to_pay || null,
      total_paid_amount: req.body.total_paid_amount || null,
      emi_amount: req.body.emi_amount || null,
      payment_date: req.body.payment_date || null,
      balance_from_original_emi: req.body.balance_from_original_emi || null,
      last_month_due: req.body.last_month_due || null,
      rounded_emi: req.body.rounded_emi || null,
      total_amount_to_be_repaid: req.body.total_amount_to_be_repaid || null,
      total_extra_paid_amount: req.body.total_extra_paid_amount || null,
      approved_amount: req.body.approved_amount || null,
      paid_amount: req.body.paid_amount || null,
      collected_amount: req.body.collected_amount || null,
      remaining_balance: req.body.remaining_balance || null,
      no_of_loan_terms: req.body.no_of_loan_terms || null,
      paid_status: req.body.paid_status || 'Unpaid',
      payment_mode: req.body.payment_mode || 'Cash',
      penalty: req.body.penalty || null,
      received_date: req.body.received_date || null,
      total_months: req.body.total_months || null,
      image: null,
    };

    const insertQuery = `
    INSERT INTO ScheduleEmi (
      principal_loan_amount, annual_interest, manual_interest, monthly_interest_amount,
      manual_interest_rate, balance_need_to_pay, total_paid_amount, emi_amount,
      payment_date, balance_from_original_emi, last_month_due, rounded_emi,
      total_amount_to_be_repaid, total_extra_paid_amount, approved_amount,
      paid_amount, collected_amount, remaining_balance, no_of_loan_terms,
      paid_status, payment_mode, penalty, received_date, total_months, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  

    const values = Object.values(loanData);
    const [result] = await pool.query(insertQuery, values);
    const loanId = result.insertId;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(2);
    const formId = `SE${day}${month}${year}${loanId}`;

    const updateQuery = `
    UPDATE ScheduleEmi SET form_id = ? WHERE id = ?`;
    await pool.query(updateQuery, [formId, loanId]);

    loanData.form_id = loanId;
    const folderPath = `Finance/ScheduleEmi/${formId}`;

    if (files.image) {
      loanData.image = await uploadFileToSpaces(
        files.image[0],
        `${folderPath}/Image`
      );
   
    const updateFilesQuery = `
      UPDATE ScheduleEmi SET 
        image = ? 
      WHERE form_id = ?
    `;

    const updateFilesValues = [
      loanData.image,
      formId,
    ];

    await pool.query(updateFilesQuery, updateFilesValues);
    }
    res.status(201).json({
      message: "ScheduleEmi created successfully",
      loanId: loanId,
    });
  } catch (error) {
    console.error("Error creating ScheduleEmi:", error);
    res.status(500).json({ message: "Error creating ScheduleEmi", error: error.message });
  }
};

const updateScheduleEmi = async (req, res) => {
  try {
    const files = req.files || {};
    const loanId = req.params.form_id; 

    const loanData = {
      principal_loan_amount: req.body.principal_loan_amount,
      annual_interest: req.body.annual_interest,
      manual_interest: req.body.manual_interest,
      monthly_interest_amount: req.body.monthly_interest_amount,
      manual_interest_rate: req.body.manual_interest_rate,
      balance_need_to_pay: req.body.balance_need_to_pay,
      total_paid_amount: req.body.total_paid_amount,
      emi_amount: req.body.emi_amount,
      payment_date: req.body.payment_date,
      balance_from_original_emi: req.body.balance_from_original_emi,
      last_month_due: req.body.last_month_due,
      rounded_emi: req.body.rounded_emi,
      total_amount_to_be_repaid: req.body.total_amount_to_be_repaid,
      total_extra_paid_amount: req.body.total_extra_paid_amount,
      approved_amount: req.body.approved_amount,
      paid_amount: req.body.paid_amount,
      collected_amount: req.body.collected_amount,
      remaining_balance: req.body.remaining_balance,
      no_of_loan_terms: req.body.no_of_loan_terms,
      paid_status: req.body.paid_status,
      payment_mode: req.body.payment_mode,
      penalty: req.body.penalty,
      received_date: req.body.received_date,
      total_months: req.body.total_months,
      // image: null, 
    };

    const updateQuery = `
      UPDATE ScheduleEmi SET 
        principal_loan_amount = ?, annual_interest = ?, manual_interest = ?, monthly_interest_amount = ?, 
        manual_interest_rate = ?, balance_need_to_pay = ?, total_paid_amount = ?, emi_amount = ?, 
        payment_date = ?, balance_from_original_emi = ?, last_month_due = ?, rounded_emi = ?, total_amount_to_be_repaid = ?, 
        total_extra_paid_amount = ?, approved_amount = ?, paid_amount = ?, collected_amount = ?, remaining_balance = ?, 
        no_of_loan_terms = ?, paid_status = ?, payment_mode = ?, penalty = ?, received_date = ?, 
        total_months = ?, modified_on = CURRENT_TIMESTAMP
      WHERE form_id = ?
    `;

    const values = [
      loanData.principal_loan_amount,
      loanData.annual_interest,
      loanData.manual_interest,
      loanData.monthly_interest_amount,
      loanData.manual_interest_rate,
      loanData.balance_need_to_pay,
      loanData.total_paid_amount,
      loanData.emi_amount,
      loanData.payment_date,
      loanData.balance_from_original_emi,
      loanData.last_month_due,
      loanData.rounded_emi,
      loanData.total_amount_to_be_repaid,
      loanData.total_extra_paid_amount,
      loanData.approved_amount,
      loanData.paid_amount,
      loanData.collected_amount,
      loanData.remaining_balance,
      loanData.no_of_loan_terms,
      loanData.paid_status,
      loanData.payment_mode,
      loanData.penalty,
      loanData.received_date,
      loanData.total_months,
      loanId
    ];

    await pool.query(updateQuery, values);
    const folderPath = `Finance/ScheduleEmi/${loanId}`;

    try {
      if (files.image) {
        loanData.image = await uploadFileToSpaces(
          files.image[0], 
          `${folderPath}/Image`
        );
      }

      return res.status(200).json({
        message: "Emi Schedule updated successfully",
        loanData,
        loanId
      });

    } catch (uploadError) {
      return res.status(500).json({
        message: "Error uploading files",
        error: uploadError.message
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error updating Emi Schedule",
      error: err.message
    });
  }
};

const deleteScheduleEmi = async (req, res) => {
  try {
    const loanId = req.params.form_id;
    const query = "DELETE FROM ScheduleEmi WHERE form_id = ?";
    const [result] = await pool.query(query, [loanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Emi Schedule record not found" });
    }

    res
      .status(200)
      .json({ message: "Emi Schedule record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Emi Schedule record",
      error: error.message,
    });
  }
};

const getAllScheduleEmis = async (req, res) => {
  try {
    const query = "SELECT * FROM ScheduleEmi";
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

    const resultsWithUrls = await Promise.all(
      results.map(async (loan) => ({
        ...loan,
        image: await generatePresignedUrl(loan, "image"),
      }))
    );

    res.status(200).json(resultsWithUrls);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching EmiSchedule records",
      error: error.message,
    });
  }
};

const getScheduleEmiById = async (req, res) => {
  const { form_id } = req.params;

  try {
    const query = "SELECT * FROM ScheduleEmi WHERE form_id = ?";
    const [[loan]] = await pool.query(query, [form_id]);

    if (!loan) {
      return res.status(404).json({ message: "EmiSchedule not found" });
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

    const result = {
      ...loan,
      image: await generatePresignedUrl("image"),
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching EmiSchedule by ID",
      error: error.message,
    });
  }
};

const getScheduleEmiByAdminId = async (req, res) => {
  const { adminId, adminName } = req.params;
  try {
    const loans = await ScheduleEmiModel.getScheduleEmiByAdminId(adminId, adminName);
    res.status(200).json(loans);
  } catch (err) {
    if (err.message === "Admin not found") {
      return res.status(404).json({ message: "Admin not found" });
    } else if (err.message === "Invalid role") {
      return res.status(403).json({ message: "Unauthorized role" });
    }
    res.status(500).json({
      message: "Error fetching EmiSchedule by admin ID",
      error: err.message,
    });
  }
};

const createMonthAutoSchedules = async (req, res) => {
  try {
    const loanData = {
      approved_amount: parseFloat(req.body.approved_amount) || 0,
      no_of_loan_terms: parseInt(req.body.no_of_loan_terms) || 0,
      monthly_interest_amount: parseFloat(req.body.monthly_interest_amount) || 0,
      emi_amount: parseFloat(req.body.emi_amount) || 0,
      rounded_emi: parseFloat(req.body.rounded_emi) || 0,
      payment_date: req.body.payment_date || new Date().toISOString().split("T")[0],
      paid_status: req.body.paid_status || "Unpaid",
      payment_mode: req.body.payment_mode || "Cash",
      form_id: req.body.form_id || null,
    };

    let remainingBalance =
      loanData.approved_amount + loanData.monthly_interest_amount;

    const emiSchedules = [];
    let totalEmiPaid = 0;
    let paymentDate = new Date(loanData.payment_date);

    for (let month = 1; month <= loanData.no_of_loan_terms; month++) {
      const isLastTerm = month === loanData.no_of_loan_terms;

      let paidEmi = Math.min(loanData.rounded_emi, remainingBalance);
      const loanTerm = loanData.no_of_loan_terms;
      const calculateLastMonth = loanData.rounded_emi - loanData.emi_amount;
      const lastMonthDue = calculateLastMonth * loanTerm;
      const payemi = loanData.rounded_emi - lastMonthDue;
      
      if (isLastTerm) {
        const calculatedEmi = payemi;
        paidEmi = Math.round(calculatedEmi / 10) * 10;
      }

      totalEmiPaid += paidEmi;
      remainingBalance -= paidEmi;

      emiSchedules.push({
        loan_id: null,
        no_of_loan_terms: month,
        emi_amount: paidEmi,
        remaining_balance: Math.max(remainingBalance, 0).toFixed(2),
        payment_date: paymentDate.toISOString().split("T")[0],
        approved_amount: loanData.approved_amount.toFixed(2),
        paid_status: loanData.paid_status,
        monthly_interest_amount: loanData.monthly_interest_amount.toFixed(2),
        payment_mode: loanData.payment_mode,
        form_id: loanData.form_id,
      });

      paymentDate.setMonth(paymentDate.getMonth() + 1);

      if (remainingBalance <= 0) {
        console.log("Remaining balance cleared. Stopping schedule generation.");
        break;
      }
    }

    const emiInsertQuery = `
      INSERT INTO ScheduleEmi (
        no_of_loan_terms, emi_amount, remaining_balance, payment_date, approved_amount, 
        paid_status, monthly_interest_amount, payment_mode, form_id
      ) VALUES ?`;

    const scheduleValues = emiSchedules.map((schedule) => [
      schedule.no_of_loan_terms,
      schedule.emi_amount,
      schedule.remaining_balance,
      schedule.payment_date,
      schedule.approved_amount,
      schedule.paid_status,
      schedule.monthly_interest_amount,
      schedule.payment_mode,
      schedule.form_id,
    ]);

    const [insertResult] = await pool.query(emiInsertQuery, [scheduleValues]);

    const startingLoanId = insertResult.insertId;
    emiSchedules.forEach((schedule, index) => {
      schedule.loan_id = startingLoanId + index;
    });

    res.status(201).json({
      message: "Monthly EMI schedules created successfully",
      emiSchedules,
    });
  } catch (error) {
    console.error("Error creating ScheduleEmi:", error);
    res
      .status(500)
      .json({ message: "Error creating ScheduleEmi", error: error.message });
  }
};

const createWeekAutoSchedules = async (req, res) => {
  try {
    const loanData = {
      approved_amount: parseFloat(req.body.approved_amount) || 0,
      no_of_loan_terms: parseInt(req.body.no_of_loan_terms) || 0,
      monthly_interest_amount: parseFloat(req.body.monthly_interest_amount) || 0,
      emi_amount: parseFloat(req.body.emi_amount) || 0,
      rounded_emi: parseFloat(req.body.rounded_emi) || 0,
      payment_date: req.body.payment_date || new Date().toISOString().split("T")[0],
      paid_status: req.body.paid_status || "Unpaid",
      payment_mode: req.body.payment_mode || "Cash",
      form_id: req.body.form_id || null,
    };

    let remainingBalance =
      loanData.approved_amount + loanData.monthly_interest_amount;

    const emiSchedules = [];
    let totalEmiPaid = 0;
    let paymentDate = new Date(loanData.payment_date);

    for (let week = 1; week <= loanData.no_of_loan_terms; week++) {
      const isLastTerm = week === loanData.no_of_loan_terms;

      let paidEmi = Math.min(loanData.rounded_emi, remainingBalance);
      const loanTerm = loanData.no_of_loan_terms;
      const calculateLastWeek = loanData.rounded_emi - loanData.emi_amount;
      const lastWeekDue = calculateLastWeek * loanTerm;
      const payEmi = loanData.rounded_emi - lastWeekDue;

      if (isLastTerm) {
        const calculatedEmi = payEmi;
        paidEmi = Math.round(calculatedEmi / 10) * 10;
      }

      totalEmiPaid += paidEmi;
      remainingBalance -= paidEmi;

      emiSchedules.push({
        loan_id: null,
        no_of_loan_terms: week,
        emi_amount: paidEmi,
        remaining_balance: Math.max(remainingBalance, 0).toFixed(2),
        payment_date: paymentDate.toISOString().split("T")[0],
        approved_amount: loanData.approved_amount.toFixed(2),
        paid_status: loanData.paid_status,
        monthly_interest_amount: loanData.monthly_interest_amount.toFixed(2),
        payment_mode: loanData.payment_mode,
        form_id: loanData.form_id,
      });

      paymentDate.setDate(paymentDate.getDate() + 7); // Increment by 7 days

      if (remainingBalance <= 0) {
        console.log("Remaining balance cleared. Stopping schedule generation.");
        break;
      }
    }

    const emiInsertQuery = `
      INSERT INTO ScheduleEmi (
        no_of_loan_terms, emi_amount, remaining_balance, payment_date, approved_amount,
        paid_status, monthly_interest_amount, payment_mode, form_id
      ) VALUES ?`;

    const scheduleValues = emiSchedules.map((schedule) => [
      schedule.no_of_loan_terms,
      schedule.emi_amount,
      schedule.remaining_balance,
      schedule.payment_date,
      schedule.approved_amount,
      schedule.paid_status,
      schedule.monthly_interest_amount,
      schedule.payment_mode,
      schedule.form_id,
    ]);

    const [insertResult] = await pool.query(emiInsertQuery, [scheduleValues]);

    const startingLoanId = insertResult.insertId;
    emiSchedules.forEach((schedule, index) => {
      schedule.loan_id = startingLoanId + index;
    });

    res.status(201).json({
      message: "Weekly EMI schedules created successfully",
      emiSchedules,
    });
  } catch (error) {
    console.error("Error creating ScheduleEmi:", error);
    res
      .status(500)
      .json({ message: "Error creating ScheduleEmi", error: error.message });
  }
};

const createDailyAutoSchedules = async (req, res) => {
  try {
    const loanData = {
      approved_amount: parseFloat(req.body.approved_amount) || 0,
      no_of_loan_terms: parseInt(req.body.no_of_loan_terms) || 0,
      monthly_interest_amount: parseFloat(req.body.monthly_interest_amount) || 0,
      emi_amount: parseFloat(req.body.emi_amount) || 0,
      rounded_emi: parseFloat(req.body.rounded_emi) || 0,
      payment_date: req.body.payment_date || new Date().toISOString().split("T")[0],
      paid_status: req.body.paid_status || "Unpaid",
      payment_mode: req.body.payment_mode || "Cash",
      form_id: req.body.form_id || null,
    };

    let remainingBalance =
      loanData.approved_amount + loanData.monthly_interest_amount;

    const emiSchedules = [];
    let totalEmiPaid = 0;
    let paymentDate = new Date(loanData.payment_date);

    for (let day = 1; day <= loanData.no_of_loan_terms; day++) {
      const isLastTerm = day === loanData.no_of_loan_terms;

      let paidEmi = Math.min(loanData.rounded_emi, remainingBalance);
      const loanTerm = loanData.no_of_loan_terms;
      const calculateLastDay = loanData.rounded_emi - loanData.emi_amount;
      const lastDayDue = calculateLastDay * loanTerm;
      const payEmi = loanData.rounded_emi - lastDayDue;

      if (isLastTerm) {
        const calculatedEmi = payEmi;
        paidEmi = Math.round(calculatedEmi / 10) * 10;
      }

      totalEmiPaid += paidEmi;
      remainingBalance -= paidEmi;

      emiSchedules.push({
        loan_id: null,
        no_of_loan_terms: day,
        emi_amount: paidEmi,
        remaining_balance: Math.max(remainingBalance, 0).toFixed(2),
        payment_date: paymentDate.toISOString().split("T")[0],
        approved_amount: loanData.approved_amount.toFixed(2),
        paid_status: loanData.paid_status,
        monthly_interest_amount: loanData.monthly_interest_amount.toFixed(2),
        payment_mode: loanData.payment_mode,
        form_id: loanData.form_id,
      });

      paymentDate.setDate(paymentDate.getDate() + 1); // Increment by 1 day

      if (remainingBalance <= 0) {
        console.log("Remaining balance cleared. Stopping schedule generation.");
        break;
      }
    }

    const emiInsertQuery = `
      INSERT INTO ScheduleEmi (
        no_of_loan_terms, emi_amount, remaining_balance, payment_date, approved_amount,
        paid_status, monthly_interest_amount, payment_mode, form_id
      ) VALUES ?`;

    const scheduleValues = emiSchedules.map((schedule) => [
      schedule.no_of_loan_terms,
      schedule.emi_amount,
      schedule.remaining_balance,
      schedule.payment_date,
      schedule.approved_amount,
      schedule.paid_status,
      schedule.monthly_interest_amount,
      schedule.payment_mode,
      schedule.form_id,
    ]);

    const [insertResult] = await pool.query(emiInsertQuery, [scheduleValues]);

    const startingLoanId = insertResult.insertId;
    emiSchedules.forEach((schedule, index) => {
      schedule.loan_id = startingLoanId + index;
    });

    res.status(201).json({
      message: "Daily EMI schedules created successfully",
      emiSchedules,
    });
  } catch (error) {
    console.error("Error creating ScheduleEmi:", error);
    res
      .status(500)
      .json({ message: "Error creating ScheduleEmi", error: error.message });
  }
};

const createManualEmi = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const formIdFromParams = req.params.form_id;
    const approvedAmount = parseFloat(req.params.approved_amount);
    const terms = parseInt(req.params.terms, 10);
    const interestAmount = parseFloat(req.params.interest_amount);

    if (isNaN(approvedAmount) || isNaN(terms) || isNaN(interestAmount)) {
      return res.status(400).json({ message: "Invalid parameters provided." });
    }
    if (interestAmount < 0 || interestAmount > 100000000) {
      return res.status(400).json({
        message: "Interest amount must be between 0 and 100,000,000.",
      });
    }

    const totalAmount = approvedAmount + interestAmount;
    const emiAmount = totalAmount / terms;

    const emiDataArray = [];
    let remainingBalance = totalAmount;

    for (let i = 0; i < terms; i++) {
      const isLastTerm = i === terms - 1;
      if (!isLastTerm) remainingBalance -= emiAmount;

      emiDataArray.push({
        principal_loan_amount: approvedAmount,
        monthly_interest_amount: interestAmount,
        emi_amount: emiAmount,
        remaining_balance: isLastTerm ? 0 : remainingBalance,
        no_of_loan_terms: terms,
        paid_status: "Unpaid",
        payment_mode: "Cash",
        form_id: formIdFromParams,
      });
    }

    if (emiDataArray.length === 0) {
      return res.status(400).json({
        message: "No EMI data to insert. Please check the input values.",
      });
    }

    const insertQuery = `
      INSERT INTO ScheduleEmi (
        principal_loan_amount, monthly_interest_amount, emi_amount, 
        remaining_balance, no_of_loan_terms, paid_status, 
        payment_mode, form_id
      ) VALUES ?
    `;

    const values = emiDataArray.map((emi) => [
      emi.principal_loan_amount,
      emi.monthly_interest_amount,
      emi.emi_amount,
      emi.remaining_balance,
      emi.no_of_loan_terms,
      emi.paid_status,
      emi.payment_mode,
      emi.form_id,
    ]);

    await connection.query(insertQuery, [values]);

    await connection.commit();
    return res
      .status(200)
      .json({ message: "EMI schedule created successfully" });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      message: "Error creating EMI schedule",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const createSingleManualEmi = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const formId = req.params.form_id;
    const approvedAmount = parseFloat(req.params.approved_amount);
    const terms = parseInt(req.params.terms, 10);
    const interestAmount = parseFloat(req.params.interest_amount);
    const emiSchedule = req.params.emi_schedule;

    const validSchedules = ['Weekly', 'Daily', 'Monthly'];
    if (!validSchedules.includes(emiSchedule)) {
      return res.status(400).json({ message: "Invalid EMI schedule provided." });
    }

    if (isNaN(approvedAmount) || isNaN(terms) || isNaN(interestAmount)) {
      return res.status(400).json({ message: "Invalid parameters provided." });
    }

    if (interestAmount < 0 || interestAmount > 100000000) {
      return res.status(400).json({
        message: "Interest amount must be between 0 and 100,000,000.",
      });
    }

    const totalAmount = approvedAmount + interestAmount;
    let emiAmount = totalAmount / terms;

    let singleTermRoundedEmi = Math.round(emiAmount);

    if (emiSchedule === "Weekly" || emiSchedule === "Daily") {
      const lastDigit = singleTermRoundedEmi % 10;
      if (lastDigit > 0) {
        const roundingMap = {
          1: 9,
          2: 8,
          3: 7,
          4: 6,
          5: 5,
          6: 4,
          7: 3,
          8: 2,
          9: 1,
        };
        singleTermRoundedEmi += roundingMap[lastDigit];
      }
    } else if (emiSchedule === "Monthly") {
      const lastTwoDigits = singleTermRoundedEmi % 100;
      if (lastTwoDigits > 0) {
        if (lastTwoDigits <= 49) {
          singleTermRoundedEmi += 50 - lastTwoDigits;
        } else {
          singleTermRoundedEmi += 100 - lastTwoDigits;
        }
      }
    }

    const totalRoundedEmi = singleTermRoundedEmi * terms;

    const [existingRecords] = await connection.query(
      `SELECT * FROM ScheduleEmi WHERE form_id = ? ORDER BY id DESC LIMIT 1`,
      [formId]
    );

    let newTerms = 1;
    let remainingBalance = totalAmount;
    let paidAmount = req.body.paid_amount || emiAmount;
    let lastMonthDue = 0;
    let balanceFromOriginalEmi = 0;
    let penalty = 0;
    let lastTermEmiAmount = emiAmount;

    if (existingRecords.length > 0) {
      const previousRecord = existingRecords[0];

      if (
        parseFloat(previousRecord.remaining_balance) === 0 &&
        previousRecord.paid_status === "Paid"
      ) {
        return res.status(400).json({
          message:
            "This EMI is already fully paid and cannot be updated further.",
        });
      }

      newTerms = previousRecord.term + 1;
      remainingBalance = previousRecord.remaining_balance;
      lastMonthDue = remainingBalance - emiAmount;

      paidAmount = req.body.paid_amount || emiAmount;
      remainingBalance -= paidAmount;

      if (remainingBalance < 0) {
        penalty = Math.abs(remainingBalance);
        remainingBalance = 0;
      }

      balanceFromOriginalEmi =
        previousRecord.balance_from_original_emi + remainingBalance;

      if (newTerms === terms) {
        lastTermEmiAmount =
          totalRoundedEmi - singleTermRoundedEmi * (terms - 1);
      }
    } else {
      remainingBalance = totalAmount - paidAmount;
      if (remainingBalance < 0) {
        penalty = Math.abs(remainingBalance);
        remainingBalance = 0;
      }
    }

    if (newTerms === 1) {
      lastTermEmiAmount = remainingBalance;
      remainingBalance = totalRoundedEmi - lastTermEmiAmount;
      remainingBalance = approvedAmount - remainingBalance;
    }

    singleTermRoundedEmi = singleTermRoundedEmi - emiAmount;
    lastTermEmiAmount = singleTermRoundedEmi * terms;
    emiAmount = singleTermRoundedEmi + emiAmount;

    const newEmiRecord = {
      form_id: formId,
      approved_amount: approvedAmount,
      principal_loan_amount: totalAmount,
      monthly_interest_amount: interestAmount,
      emi_amount: emiAmount,
      single_term_rounded_emi: singleTermRoundedEmi,
      rounded_emi: totalRoundedEmi,
      paid_amount: paidAmount,
      remaining_balance: remainingBalance,
      term: newTerms,
      no_of_loan_terms: terms,
      balance_from_original_emi: balanceFromOriginalEmi,
      last_month_due: lastMonthDue,
      penalty,
      received_date: new Date(),
      paid_status: req.body.paid_status,
      payment_mode: req.body.payment_mode || "Cash",
      total_rounded_emi: lastTermEmiAmount,
      emi_schedule: emiSchedule,
      created_employee_name: req.body.created_employee_name, 
      created_employee_id: req.body.created_employee_id, 
    };

    const insertQuery = `
      INSERT INTO ScheduleEmi (
        form_id, approved_amount, principal_loan_amount, monthly_interest_amount, emi_amount, 
        single_term_rounded_emi, rounded_emi, paid_amount, remaining_balance, term, 
        no_of_loan_terms, balance_from_original_emi, last_month_due, 
        penalty, received_date, paid_status, payment_mode, total_rounded_emi, emi_schedule,
        created_employee_name, created_employee_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(insertQuery, Object.values(newEmiRecord));

    await connection.commit();
    return res.status(200).json({
      message: "Single EMI record created successfully.",
      data: newEmiRecord,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating EMI record:", error);
    return res.status(500).json({
      message: "Error creating EMI record.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};



const getAllSingleManualByid = async (req, res) => {
  try {
    const formId = req.params.form_id;

    const query = `SELECT * FROM ScheduleEmi WHERE form_id = ?`;
    const [result] = await pool.query(query, [formId]);

    if (result.length === 0) {
      return res.status(404).json({
        message: "No schedules found for the given form ID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedules retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving schedules:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getManualSchedulePaidRecords = async (req, res) => {
  try {
    const formId = req.params.form_id;

    const query = `SELECT * FROM ScheduleEmi WHERE form_id = ? AND paid_status = 'paid'`;
    const [result] = await pool.query(query, [formId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No paid records found for the given form ID",
      });
    }

    const formattedResults = result.map(record => {
      if (record.payment_date) {
        record.payment_date = formatDate(new Date(record.payment_date));
      }

      return record;
    });

    return res.status(200).json({
      success: true,
      message: "Paid records retrieved successfully",
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error retrieving paid records:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getManualScheduleUnPaidRecords = async (req, res) => {
  try {
    const formId = req.params.form_id;

    const query = `SELECT * FROM ScheduleEmi WHERE form_id = ? AND paid_status = 'unpaid'`;
    const [result] = await pool.query(query, [formId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Unpaid records found",
      });
    }

    const formattedResults = result.map(record => {
      if (record.payment_date) {
        record.payment_date = formatDate(new Date(record.payment_date));
      }
      return record;
    });

    return res.status(200).json({
      success: true,
      message: "Unpaid records retrieved successfully",
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error retrieving unpaid records:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const fetchHomeLoansByScheduleEmiCondition = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { form_id } = req.params;

    let fetchEmiQuery = `
      SELECT form_id 
      FROM ScheduleEmi 
      WHERE fully_paid = 'yes' AND remaining_balance = 0
    `;
    const queryParams = [];

    if (form_id) {
      fetchEmiQuery += ` AND form_id = ?`;
      queryParams.push(form_id);
    }

    const [emiRecords] = await connection.query(fetchEmiQuery, queryParams);

    if (emiRecords.length === 0) {
      return res
        .status(404)
        .json({
          message: "No matching records found in ScheduleEmi for Home Loans.",
        });
    }

    const formIds = emiRecords.map((record) => record.form_id);

    const fetchHomeLoanQuery = `
      SELECT * 
      FROM VehicleLoan 
      WHERE form_id IN (?)
    `;
    const [homeLoans] = await connection.query(fetchHomeLoanQuery, [formIds]);

    return res.status(200).json({
      success: true,
      message: "Home Loans fetched successfully",
      data: homeLoans,
    });
  } catch (error) {
    console.error("Error fetching home loans:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchPersonalLoansByScheduleEmiCondition = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { form_id } = req.params;

    let fetchEmiQuery = `
      SELECT form_id 
      FROM ScheduleEmi 
      WHERE fully_paid = 'yes' OR remaining_balance = 0
    `;
    const queryParams = [];

    if (form_id) {
      fetchEmiQuery += ` AND form_id = ?`;
      queryParams.push(form_id);
    }

    const [emiRecords] = await connection.query(fetchEmiQuery, queryParams);

    if (emiRecords.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No matching records found in ScheduleEmi for Personal Loans.",
        });
    }

    const formIds = emiRecords.map((record) => record.form_id);

    const fetchPersonalLoanQuery = `
      SELECT * 
      FROM PersonalLoan 
      WHERE form_id IN (?)
    `;
    const [personalLoans] = await connection.query(fetchPersonalLoanQuery, [
      formIds,
    ]);

    return res.status(200).json({
      success: true,
      message: "Personal Loans fetched successfully",
      data: personalLoans,
    });
  } catch (error) {
    console.error("Error fetching personal loans:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsByAdmin = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const { filter = "today" } = req.query;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message:
          "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const currentDate = new Date();
    let fromDate, toDate;

    switch (filter.toLowerCase()) {
      case "last24hours":
        fromDate = new Date(currentDate);
        fromDate.setHours(currentDate.getHours() - 24);
        toDate = currentDate;
        break;

      case "yesterday": {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        fromDate = new Date(yesterday);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(yesterday);
        toDate.setHours(23, 59, 59, 999);
        break;
      }

      case "last7days":
        fromDate = new Date(currentDate);
        fromDate.setDate(currentDate.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(currentDate);
        toDate.setHours(23, 59, 59, 999);
        break;

      case "last30days":
        fromDate = new Date(currentDate);
        fromDate.setDate(currentDate.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(currentDate);
        toDate.setHours(23, 59, 59, 999);
        break;

      case "thisyear":
        fromDate = new Date(currentDate.getFullYear(), 0, 1);
        toDate = new Date(currentDate);
        toDate.setHours(23, 59, 59, 999);
        break;

      default:
        return res.status(400).json({ message: "Invalid filter condition." });
    }

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    console.log("From Date String:", fromDateString);
    console.log("To Date String:", toDateString);

    const loanQuery = `
      SELECT 
          SUM(paid_amount) AS total_paid_amount, 
          COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE 
          (created_employee_id = ? OR created_employee_name = ?)
          AND DATE(received_date) BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, fromDateString, toDateString];

    // console.log("SQL Query:", loanQuery);
    // console.log("Query Params:", params);

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the specified criteria.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully by admin",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts by admin:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsToday = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const currentDate = new Date();
    const fromDate = new Date(currentDate.setHours(0, 0, 0, 0));
    const toDate = new Date(currentDate.setHours(23, 59, 59, 999));

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDateString,
      toDateString,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for today.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for today",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for today:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsYesterday = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const fromDate = yesterday;
    const toDate = new Date(yesterday);
    toDate.setHours(23, 59, 59, 999);

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDateString,
      toDateString,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for yesterday.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for yesterday",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for yesterday:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsLast7Days = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const currentDate = new Date();
    const fromDate = new Date(currentDate.setDate(currentDate.getDate() - 6));
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date();

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDateString,
      toDateString,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the last 7 days.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the last 7 days",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for last 7 days:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsLast30Days = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const currentDate = new Date();
    const fromDate = new Date(currentDate.setDate(currentDate.getDate() - 29));
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date();

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDateString,
      toDateString,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the last 30 days.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the last 30 days",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for last 30 days:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsThisYear = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const currentDate = new Date();
    const fromDate = new Date(currentDate.getFullYear(), 0, 1); 
    const toDate = new Date();

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDateString,
      toDateString,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for this year.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for this year",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for this year:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsByAdminToday = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const { filter = "today" } = req.query;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const today = new Date();
    const fromDate = today.toISOString().split('T')[0] + ' 00:00:00';
    const toDate = today.toISOString().split('T')[0] + ' 23:59:59';

    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);

    const loanQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE 
        (created_employee_id = ? OR created_employee_name = ?)
        AND received_date BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, fromDate, toDate];

    // console.log("SQL Query:", loanQuery);
    // console.log("Query Params:", params);

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for today.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for today.",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};


const fetchEmiPaidAmountsByAdminYesterday = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); 
    const yesterdayStart = `${yesterday.toISOString().split('T')[0]} 00:00:00`;
    const yesterdayEnd = `${yesterday.toISOString().split('T')[0]} 23:59:59`;

    console.log("Yesterday's Start Time:", yesterdayStart);
    console.log("Yesterday's End Time:", yesterdayEnd);

    const loanQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE 
        (created_employee_id = ? OR created_employee_name = ?)
        AND received_date BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, yesterdayStart, yesterdayEnd];

    // console.log("SQL Query:", loanQuery);
    // console.log("Query Params:", params);

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for yesterday.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for yesterday.",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};


const fetchEmiPaidAmountsByAdminLast7Days = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const currentDate = new Date();
    const fromDate = new Date(currentDate);
    fromDate.setDate(currentDate.getDate() - 6);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(currentDate);
    toDate.setHours(23, 59, 59, 999);

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const loanQuery = `
      SELECT SUM(paid_amount) AS total_paid_amount, COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE (created_employee_id = ? OR created_employee_name = ?)
      AND DATE(received_date) BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, fromDateString, toDateString];

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the last 7 days.",
        data: { total_paid_amount: 0, total_records: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the last 7 days.",
      data: results[0],
    });
  } catch (error) {
    console.error("Error fetching paid amounts for last 7 days:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsByAdminLast30Days = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const currentDate = new Date();
    const fromDate = new Date(currentDate);
    fromDate.setDate(currentDate.getDate() - 29);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(currentDate);
    toDate.setHours(23, 59, 59, 999);

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const loanQuery = `
      SELECT SUM(paid_amount) AS total_paid_amount, COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE (created_employee_id = ? OR created_employee_name = ?)
      AND DATE(received_date) BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, fromDateString, toDateString];

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the last 30 days.",
        data: { total_paid_amount: 0, total_records: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the last 30 days.",
      data: results[0],
    });
  } catch (error) {
    console.error("Error fetching paid amounts for last 30 days:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsByAdminThisYear = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const decodedAdminName = decodeURIComponent(adminName.trim());

    if (!adminId || !decodedAdminName) {
      return res.status(400).json({
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized role." });
    }

    const currentYear = new Date().getFullYear();
    const fromDate = new Date(currentYear, 0, 1);  
    const toDate = new Date(currentYear, 11, 31);

    const fromDateString = fromDate.toISOString().split("T")[0];
    const toDateString = toDate.toISOString().split("T")[0];

    const loanQuery = `
      SELECT SUM(paid_amount) AS total_paid_amount, COUNT(*) AS total_records
      FROM ScheduleEmi
      WHERE (created_employee_id = ? OR created_employee_name = ?)
      AND DATE(received_date) BETWEEN ? AND ?;
    `;
    const params = [adminId, decodedAdminName, fromDateString, toDateString];

    const [results] = await connection.query(loanQuery, params);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for this year.",
        data: { total_paid_amount: 0, total_records: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for this year.",
      data: results[0],
    });
  } catch (error) {
    console.error("Error fetching paid amounts for this year:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const getPaidScheduleById = async (req, res) => {
  try {
    const recordId = req.params.id;

    const query = `SELECT * FROM ScheduleEmi WHERE id = ?`;
    const [result] = await pool.query(query, [recordId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No paid records found for the given ID",
      });
    }

    const formattedResults = result.map(record => {
      if (record.payment_date) {
        record.payment_date = formatDate(new Date(record.payment_date));
      }
      if (record.received_date) {
        record.received_date = formatDate(new Date(record.received_date));
      }
      return record;
    });

    return res.status(200).json({
      success: true,
      message: "Paid records retrieved successfully",
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error retrieving paid records:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const UpdateScheduleById = async (req, res) => {
  try {
    const files = req.files || {};
    const loanId = req.params.id;
    
    const formattedDate = (date) => {
      if (!date) return null;
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    };

    const loanData = {
      principal_loan_amount: req.body.principal_loan_amount,
      annual_interest: req.body.annual_interest,
      manual_interest: req.body.manual_interest,
      monthly_interest_amount: req.body.monthly_interest_amount,
      manual_interest_rate: req.body.manual_interest_rate,
      balance_need_to_pay: req.body.balance_need_to_pay,
      total_paid_amount: req.body.total_paid_amount,
      emi_amount: req.body.emi_amount,
      payment_date: formattedDate(req.body.payment_date),
      balance_from_original_emi: req.body.balance_from_original_emi,
      last_month_due: req.body.last_month_due,
      rounded_emi: req.body.rounded_emi,
      total_amount_to_be_repaid: req.body.total_amount_to_be_repaid,
      total_extra_paid_amount: req.body.total_extra_paid_amount,
      approved_amount: req.body.approved_amount,
      paid_amount: req.body.paid_amount,
      collected_amount: req.body.collected_amount,
      remaining_balance: req.body.remaining_balance,
      no_of_loan_terms: req.body.no_of_loan_terms,
      paid_status: req.body.paid_status,
      payment_mode: req.body.payment_mode,
      penalty: req.body.penalty,
      received_date: req.body.received_date,
      total_months: req.body.total_months,
    };

    const updateQuery = `
  UPDATE ScheduleEmi SET 
    principal_loan_amount = ?, annual_interest = ?, manual_interest = ?, monthly_interest_amount = ?, 
    manual_interest_rate = ?, balance_need_to_pay = ?, total_paid_amount = ?, emi_amount = ?, 
    payment_date = ?, balance_from_original_emi = ?, last_month_due = ?, rounded_emi = ?, total_amount_to_be_repaid = ?, 
    total_extra_paid_amount = ?, approved_amount = ?, paid_amount = ?, collected_amount = ?, remaining_balance = ?, 
    no_of_loan_terms = ?, paid_status = ?, payment_mode = ?, penalty = ?, received_date = ?, 
    total_months = ?, modified_on = CURRENT_TIMESTAMP
  WHERE id = ?
`;

const values = [
  loanData.principal_loan_amount,
  loanData.annual_interest,
  loanData.manual_interest,
  loanData.monthly_interest_amount,
  loanData.manual_interest_rate,
  loanData.balance_need_to_pay,
  loanData.total_paid_amount,
  loanData.emi_amount,
  loanData.payment_date,
  loanData.balance_from_original_emi,
  loanData.last_month_due,
  loanData.rounded_emi,
  loanData.total_amount_to_be_repaid,
  loanData.total_extra_paid_amount,
  loanData.approved_amount,
  loanData.paid_amount,
  loanData.collected_amount,
  loanData.remaining_balance,
  loanData.no_of_loan_terms,
  loanData.paid_status,
  loanData.payment_mode,
  loanData.penalty,
  loanData.received_date,
  loanData.total_months,
  loanId
];

console.log('Updating with values:', values);

    await pool.query(updateQuery, values);
    const folderPath = `Finance/ScheduleEmi/${loanId}`;

    try {
      if (files.image) {
        loanData.image = await uploadFileToSpaces(
          files.image[0], 
          `${folderPath}/Image`
        );
      }

      return res.status(200).json({
        message: "Emi Schedule updated successfully",
        loanData,
        loanId
      });

    } catch (uploadError) {
      return res.status(500).json({
        message: "Error uploading files",
        error: uploadError.message
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error updating Emi Schedule",
      error: err.message
    });
  }
};

const fetchEmiPaidAmountsByDateRange = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Both 'fromDate' and 'toDate' query parameters are required.",
      });
    }

    const fromDateObject = new Date(fromDate);
    const toDateObject = new Date(toDate);

    if (isNaN(fromDateObject) || isNaN(toDateObject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use 'YYYY-MM-DD'.",
      });
    }

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      fromDate,
      toDate,
    ]);

    if (results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the specified date range.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the specified date range.",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts for the specified date range:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    connection.release();
  }
};

const fetchEmiPaidAmountsByDateRangeAndAdmin = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { adminId, adminName } = req.params;
    const { fromDate, toDate } = req.query;

    if (!adminId || !adminName) {
      return res.status(400).json({
        success: false,
        message: "Please provide both adminId and adminName to filter the data.",
      });
    }

    const decodedAdminName = decodeURIComponent(adminName.trim());

    const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
    const [adminResult] = await connection.query(adminQuery, [adminId]);

    if (adminResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const adminRole = adminResult[0].role;
    if (adminRole !== "agent" && adminRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role.",
      });
    }

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Both 'fromDate' and 'toDate' query parameters are required.",
      });
    }

    const fromDateObject = new Date(fromDate);
    const toDateObject = new Date(toDate);

    if (isNaN(fromDateObject) || isNaN(toDateObject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use 'YYYY-MM-DD'.",
      });
    }

    const fetchPaidAmountQuery = `
      SELECT 
        SUM(paid_amount) AS total_paid_amount, 
        COUNT(*) AS total_records 
      FROM ScheduleEmi 
      WHERE 
        (created_employee_id = ? OR created_employee_name = ?)
        AND DATE(received_date) BETWEEN ? AND ?;
    `;

    const [results] = await connection.query(fetchPaidAmountQuery, [
      adminId,
      decodedAdminName,
      fromDate,
      toDate,
    ]);

    if (!results || results.length === 0 || !results[0].total_paid_amount) {
      return res.status(200).json({
        success: true,
        message: "No records found for the specified date range.",
        data: {
          total_paid_amount: 0,
          total_records: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid amounts fetched successfully for the specified date range.",
      data: {
        total_paid_amount: results[0].total_paid_amount,
        total_records: results[0].total_records,
      },
    });
  } catch (error) {
    console.error("Error fetching paid amounts by admin and date range:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createScheduleEmi,
  updateScheduleEmi,
  deleteScheduleEmi,
  getAllScheduleEmis,
  getScheduleEmiById,
  getScheduleEmiByAdminId,
  createMonthAutoSchedules,
  createWeekAutoSchedules,
  createDailyAutoSchedules,
  createManualEmi,
  createSingleManualEmi,
  getAllSingleManualByid,
  getManualSchedulePaidRecords,
  getManualScheduleUnPaidRecords,
  fetchHomeLoansByScheduleEmiCondition,
  fetchPersonalLoansByScheduleEmiCondition,
  // fetchEmiPaidAmounts,
  fetchEmiPaidAmountsByAdmin,
  fetchEmiPaidAmountsToday,
  fetchEmiPaidAmountsYesterday,
  fetchEmiPaidAmountsLast7Days,
  fetchEmiPaidAmountsLast30Days,
  fetchEmiPaidAmountsThisYear,
  fetchEmiPaidAmountsByAdminToday,
  fetchEmiPaidAmountsByAdminYesterday,
  fetchEmiPaidAmountsByAdminLast7Days,
  fetchEmiPaidAmountsByAdminLast30Days,
  fetchEmiPaidAmountsByAdminThisYear,
  fetchEmiPaidAmountsByDateRange,
  fetchEmiPaidAmountsByDateRangeAndAdmin,
  getPaidScheduleById,
  UpdateScheduleById
};