const db = require("../config/dbConfig");

const createPersonalLoan = (loan) => {
  return db.query("INSERT INTO PersonalLoan SET ?", [loan]);
};

const getAllPersonalLoans = () => {
  return db.query("SELECT * FROM PersonalLoan");
};

const updatePersonalLoan = (form_id, loan) => {
  return db.query("UPDATE PersonalLoan SET ? WHERE form_id = ?", [
    loan,
    form_id,
  ]);
};

const deletePersonalLoan = (form_id) => {
  return db.query("DELETE FROM PersonalLoan WHERE form_id = ?", [form_id]);
};

const getPersonalLoanById = (form_id) => {
  return db.query("SELECT * FROM PersonalLoan WHERE form_id = ?", [form_id]);
};

const getPersonalLoanByEmail = (email) => {
  return db.query("SELECT * FROM PersonalLoan WHERE email = ?", [email]);
};

const getPersonalLoanByMobile = (mobile) => {
  return db.query("SELECT * FROM PersonalLoan WHERE mobile = ?", [mobile]);
};

const getPersonalLoanByAdminId = async (adminId, adminName) => {
  const adminQuery = "SELECT role FROM ADMIN WHERE id = ?";
  const [adminResult] = await db.query(adminQuery, [adminId]);

  if (adminResult.length === 0) {
    throw new Error("Admin not found");
  }

  const adminRole = adminResult[0].role;

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE created_employee_id = ? OR created_employee_name = ? OR assigned_to IN (?, ?)
    `;
    params = [adminId, adminId, adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = "SELECT * FROM PersonalLoan";
    params = [];
  } else {
    throw new Error("Invalid role");
  }

  const [loans] = await db.query(loanQuery, params);
  return loans;
};

const getPersonalLoanByPendingLoanStatus = async (
  adminId,
  adminName,
  adminRole
) => {
  if (!["agent", "admin"].includes(adminRole)) {
    throw new Error("Invalid role");
  }

  let adminQuery = `
    SELECT * FROM ADMIN 
    WHERE id = ? 
      AND name = ? 
      AND role = ?
  `;
  let adminParams = [adminId, adminName, adminRole];

  const [adminResult] = await db.query(adminQuery, adminParams);

  if (adminResult.length === 0) {
    throw new Error("Admin details are incorrect");
  }

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        created_employee_id = ? 
        AND created_employee_name = ? 
        AND loan_status = 'Pending'
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        loan_status = 'Pending' 
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [];
  }

  const [loans] = await db.query(loanQuery, params);

  return loans;
};

const getPersonalLoanByRejectLoanStatus = async (
  adminId,
  adminName,
  adminRole
) => {
  if (!["agent", "admin"].includes(adminRole)) {
    throw new Error("Invalid role");
  }

  let adminQuery = `
    SELECT * FROM ADMIN 
    WHERE id = ? 
      AND name = ? 
      AND role = ?
  `;
  let adminParams = [adminId, adminName, adminRole];

  const [adminResult] = await db.query(adminQuery, adminParams);

  if (adminResult.length === 0) {
    throw new Error("Admin details are incorrect");
  }

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        created_employee_id = ? 
        AND created_employee_name = ? 
        AND loan_status = 'Rejected'
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        loan_status = 'Rejected' 
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [];
  }

  const [loans] = await db.query(loanQuery, params);

  return loans;
};

const getPersonalLoanByInProgressLoanStatus = async (
  adminId,
  adminName,
  adminRole
) => {
  if (!["agent", "admin"].includes(adminRole)) {
    throw new Error("Invalid role");
  }

  let adminQuery = `
   SELECT * FROM ADMIN 
   WHERE id = ? 
     AND name = ? 
     AND role = ?
 `;
  let adminParams = [adminId, adminName, adminRole];

  const [adminResult] = await db.query(adminQuery, adminParams);

  if (adminResult.length === 0) {
    throw new Error("Admin details are incorrect");
  }

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
     SELECT * FROM PersonalLoan 
     WHERE 
       created_employee_id = ? 
       AND created_employee_name = ? 
       AND loan_status = 'In Progress'
       AND send_approval = 'yes'
     ORDER BY send_approval_date DESC
   `;
    params = [adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = `
     SELECT * FROM PersonalLoan 
     WHERE 
       loan_status = 'In Progress' 
       AND send_approval = 'yes'
     ORDER BY send_approval_date DESC
   `;
    params = [];
  }

  const [loans] = await db.query(loanQuery, params);

  return loans;
};

const getPersonalLoanByOpenLoanStatus = async (
  adminId,
  adminName,
  adminRole
) => {
  if (!["agent", "admin"].includes(adminRole)) {
    throw new Error("Invalid role");
  }

  let adminQuery = `
    SELECT * FROM ADMIN 
    WHERE id = ? 
      AND name = ? 
      AND role = ?
  `;
  let adminParams = [adminId, adminName, adminRole];

  const [adminResult] = await db.query(adminQuery, adminParams);

  if (adminResult.length === 0) {
    throw new Error("Admin details are incorrect");
  }

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        created_employee_id = ? 
        AND created_employee_name = ? 
        AND loan_status = 'Open'
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        loan_status = 'Open' 
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [];
  }

  const [loans] = await db.query(loanQuery, params);

  return loans;
};

const getPersonalLoanByApprovedLoanStatus = async (
  adminId,
  adminName,
  adminRole
) => {
  if (!["agent", "admin"].includes(adminRole)) {
    throw new Error("Invalid role");
  }

  let adminQuery = `
    SELECT * FROM ADMIN 
    WHERE id = ? 
      AND name = ? 
      AND role = ?
  `;
  let adminParams = [adminId, adminName, adminRole];

  const [adminResult] = await db.query(adminQuery, adminParams);

  if (adminResult.length === 0) {
    throw new Error("Admin details are incorrect");
  }

  let loanQuery;
  let params;

  if (adminRole === "agent") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        created_employee_id = ? 
        AND created_employee_name = ? 
        AND loan_status = 'Approved'
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = `
      SELECT * FROM PersonalLoan 
      WHERE 
        loan_status = 'Approved' 
        AND send_approval = 'yes'
      ORDER BY send_approval_date DESC
    `;
    params = [];
  }

  const [loans] = await db.query(loanQuery, params);

  return loans;
};

const updateApprovedPersonalLoanStatus = async (loanId, loanStatus) => {
  if (!["Approved"].includes(loanStatus)) {
    throw new Error("Invalid loan status");
  }

  let approval_date_admin = null;
  if (loanStatus === "Approved") {
    const now = new Date();
    approval_date_admin = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
  }

  const updateQuery = `
    UPDATE PersonalLoan SET 
      loan_status = ?, 
      approval_date_admin = ? 
    WHERE form_id = ?
  `;

  const values = [loanStatus, approval_date_admin, loanId];

  try {
    const result = await db.query(updateQuery, values);
    return result;
  } catch (err) {
    throw new Error("Error updating loan status as approved: " + err.message);
  }
};

const updateRejectedPersonalLoanStatus = async (loanId, loanStatus) => {
  if (!["Rejected"].includes(loanStatus)) {
    throw new Error("Invalid loan status");
  }

  let rejected_date_admin = null;

  if (loanStatus === "Rejected") {
    const now = new Date();
    rejected_date_admin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }

  const updateQuery = `
    UPDATE PersonalLoan SET 
      loan_status = ?, 
      rejected_date_admin = ? 
    WHERE form_id = ?
  `; 
  const values = [loanStatus, rejected_date_admin, loanId];

  try {
    const result = await db.query(updateQuery, values);
    return result;
  } catch (err) {
    throw new Error("Error updating loan status as rejected: " + err.message);
  }
};

  const updateClosedPersonalLoanStatus = async (loanId, loanStatus) => {
    if (!["Closed"].includes(loanStatus)) {
      throw new Error("Invalid loan status");
    }
  
    let rejected_date_admin = null;
  
    if (loanStatus === "Closed") {
      const now = new Date();
      rejected_date_admin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    }
  
    const updateQuery = `
      UPDATE PersonalLoan SET 
        loan_status = ?, 
        rejected_date_admin = ?
      WHERE form_id = ?
    `;
  
    const values = [loanStatus, rejected_date_admin, sendApproval, loanId];
  
    try {
      const result = await db.query(updateQuery, values);
      return result;
    } catch (err) {
      throw new Error("Error updating loan status as rejected: " + err.message);
    }
  };

  const getLoanStatusApprovedCount = async (adminId, adminName, adminRole) => {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }
  
    let adminQuery = `
      SELECT * FROM ADMIN 
      WHERE id = ? 
        AND name = ? 
        AND role = ?
    `;
    let adminParams = [adminId, adminName, adminRole];
  
    const [adminResult] = await db.query(adminQuery, adminParams);
  
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }
  
    let loanQuery;
    let params;
  
    if (adminRole === "agent") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          created_employee_id = ? 
          AND created_employee_name = ? 
          AND loan_status = 'Approved'
      `;
      params = [adminId, adminName];
    } else if (adminRole === "admin") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          loan_status = 'Approved' 
      `;
      params = [];
    }
  
    const [loans] = await db.query(loanQuery, params);
  
    return loans;
  };
  
  const getLoanStatusPendingCount = async (adminId, adminName, adminRole) => {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }
  
    let adminQuery = `
      SELECT * FROM ADMIN 
      WHERE id = ? 
        AND name = ? 
        AND role = ?
    `;
    let adminParams = [adminId, adminName, adminRole];
  
    const [adminResult] = await db.query(adminQuery, adminParams);
  
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }
  
    let loanQuery;
    let params;
  
    if (adminRole === "agent") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          created_employee_id = ? 
          AND created_employee_name = ? 
          AND loan_status = 'Pending'
      `;
      params = [adminId, adminName];
    } else if (adminRole === "admin") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          loan_status = 'Pending' 
      `;
      params = [];
    }
  
    const [loans] = await db.query(loanQuery, params);
  
    return loans;
  };
  
  const getLoanStatusInProgressCount = async (adminId, adminName, adminRole) => {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }
  
    let adminQuery = `
      SELECT * FROM ADMIN 
      WHERE id = ? 
        AND name = ? 
        AND role = ?
    `;
    let adminParams = [adminId, adminName, adminRole];
  
    const [adminResult] = await db.query(adminQuery, adminParams);
  
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }
  
    let loanQuery;
    let params;
  
    if (adminRole === "agent") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          created_employee_id = ? 
          AND created_employee_name = ? 
          AND loan_status = 'In Progress'
      `;
      params = [adminId, adminName];
    } else if (adminRole === "admin") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          loan_status = 'In Progress' 
      `;
      params = [];
    }
  
    const [loans] = await db.query(loanQuery, params);
  
    return loans;
  };
  
  const getLoanStatusRejectedCount = async (adminId, adminName, adminRole) => {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }
  
    let adminQuery = `
      SELECT * FROM ADMIN 
      WHERE id = ? 
        AND name = ? 
        AND role = ?
    `;
    let adminParams = [adminId, adminName, adminRole];
  
    const [adminResult] = await db.query(adminQuery, adminParams);
  
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }
  
    let loanQuery;
    let params;
  
    if (adminRole === "agent") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          created_employee_id = ? 
          AND created_employee_name = ? 
          AND loan_status = 'Rejected'
      `;
      params = [adminId, adminName];
    } else if (adminRole === "admin") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          loan_status = 'Rejected' 
      `;
      params = [];
    }
  
    const [loans] = await db.query(loanQuery, params);
  
    return loans;
  };
  
  const getLoanStatusClosedCount = async (adminId, adminName, adminRole) => {
    if (!["agent", "admin"].includes(adminRole)) {
      throw new Error("Invalid role");
    }
  
    let adminQuery = `
      SELECT * FROM ADMIN 
      WHERE id = ? 
        AND name = ? 
        AND role = ?
    `;
    let adminParams = [adminId, adminName, adminRole];
  
    const [adminResult] = await db.query(adminQuery, adminParams);
  
    if (adminResult.length === 0) {
      throw new Error("Admin details are incorrect");
    }
  
    let loanQuery;
    let params;
  
    if (adminRole === "agent") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          created_employee_id = ? 
          AND created_employee_name = ? 
          AND loan_status = 'Closed'
      `;
      params = [adminId, adminName];
    } else if (adminRole === "admin") {
      loanQuery = `
        SELECT * FROM PersonalLoan 
        WHERE 
          loan_status = 'Closed' 
      `;
      params = [];
    }
  
    const [loans] = await db.query(loanQuery, params);
  
    return loans;
  };
  
  const saveRemarksForPersonalLoan = async (loanId, remarks) => {
    if (!loanId || !remarks) {
      throw new Error("Loan ID and remarks are required");
    }
    const saveRemarksQuery = `
      UPDATE PersonalLoan SET
        remarks = ?
      WHERE form_id = ?
    `;
    const values = [remarks, loanId];
    try {
      const result = await db.query(saveRemarksQuery, values);
      return result;
    } catch (err) {
      throw new Error("Error saving remarks: " + err.message);
    }
  };

  const updateLoanVerificationStatus = async (loanId, updateData) => {
    const { is_verified, approvedLoanAmount, loan_id, other_charges } = updateData;
  
    const query = `
      UPDATE PersonalLoan 
      SET 
        is_verified = ?, 
        approved_loan_amount = ?, 
        loan_id = ?, 
        other_charges = ?
      WHERE form_id = ?
    `;
  
    const values = [
      is_verified,
      approvedLoanAmount,
      loan_id,
      other_charges,
      loanId,
    ];
  
    return db.query(query, values);
  };  

module.exports = {
  createPersonalLoan,
  getAllPersonalLoans,
  updatePersonalLoan,
  deletePersonalLoan,
  getPersonalLoanById,
  getPersonalLoanByEmail,
  getPersonalLoanByMobile,
  getPersonalLoanByAdminId,
  getPersonalLoanByApprovedLoanStatus,
  getPersonalLoanByPendingLoanStatus,
  getPersonalLoanByRejectLoanStatus,
  getPersonalLoanByInProgressLoanStatus,
  getPersonalLoanByOpenLoanStatus,
  updateApprovedPersonalLoanStatus,
  updateRejectedPersonalLoanStatus,
  updateClosedPersonalLoanStatus,
  getLoanStatusApprovedCount,
  getLoanStatusPendingCount,
  getLoanStatusInProgressCount,
  getLoanStatusRejectedCount,
  getLoanStatusClosedCount,
  saveRemarksForPersonalLoan,
  updateLoanVerificationStatus
};
