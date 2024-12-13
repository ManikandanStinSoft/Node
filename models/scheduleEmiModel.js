const db = require("../config/dbConfig");

const createScheduleEmi = (loan) => {
  return db.query("INSERT INTO ScheduleEmi SET ?", [loan]);
};

const getAllScheduleEmi = () => {
  return db.query("SELECT * FROM ScheduleEmi");
};

const updateScheduleEmi = (form_id, loan) => {
  return db.query("UPDATE ScheduleEmi SET ? WHERE form_id = ?", [loan, form_id]);
};

const deleteScheduleEmi = (form_id) => {
  return db.query("DELETE FROM ScheduleEmi WHERE form_id = ?", [form_id]);
};

const getScheduleEmiById = (form_id) => {
  return db.query("SELECT * FROM ScheduleEmi WHERE form_id = ?", [form_id]);
};

const getScheduleEmiByEmail = (email) => {
  return db.query("SELECT * FROM ScheduleEmi WHERE email = ?", [email]);
};

const getScheduleEmiByMobile = (mobile) => {
  return db.query("SELECT * FROM ScheduleEmi WHERE mobile = ?", [mobile]);
};

const getScheduleEmiByAdminId = async (adminId, adminName) => {
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
      SELECT * FROM ScheduleEmi 
      WHERE created_id = ? OR created_by = ? OR assigned_to IN (?, ?)
    `;
    params = [adminId, adminId, adminId, adminName];
  } else if (adminRole === "admin") {
    loanQuery = "SELECT * FROM ScheduleEmi";
    params = [];
  } else {
    throw new Error("Invalid role");
  }

  const [loans] = await db.query(loanQuery, params);
  return loans;
};

module.exports = {
  createScheduleEmi,
  getAllScheduleEmi,
  updateScheduleEmi,
  deleteScheduleEmi,
  getScheduleEmiById,
  getScheduleEmiByEmail,
  getScheduleEmiByMobile,
  getScheduleEmiByAdminId,
  getAllScheduleEmi
};
