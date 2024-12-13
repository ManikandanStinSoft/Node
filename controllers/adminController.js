const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const tokenBlacklist = new Set();

const pool = require("../config/dbConfig");
const { uploadFileToSpaces } = require("../utils/s3");

const createAdmin = async (req, res) => {
  try {
    const adminData = {
      name: req.body.name,
      dob: req.body.dob,
      age: req.body.age,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      role: req.body.role === "admin" ? "admin" : "agent",
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      status: req.body.status === "Active" ? "Active" : "Inactive",
      photo: null,
    };

    const query = `
      INSERT INTO ADMIN (
        name, dob, age, email, mobile, address, city, state, pincode, role, password, confirm_password, status, photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      adminData.name,
      adminData.dob,
      adminData.age,
      adminData.email,
      adminData.mobile,
      adminData.address,
      adminData.city,
      adminData.state,
      adminData.pincode,
      adminData.role,
      adminData.password,
      adminData.confirm_password,
      adminData.status,
      adminData.photo,
    ];

    const [result] = await pool.query(query, values);
    const adminId = result.insertId;

    const folderPath = `Finance/ADMIN/${adminId}`;

    try {
      if (req.files && req.files.photo && req.files.photo.length > 0) {
        adminData.photo = await uploadFileToSpaces(
          req.files.photo[0],
          `${folderPath}/photo`
        );

        const updateQuery = `UPDATE ADMIN SET photo = ? WHERE id = ?`;
        const updateValues = [adminData.photo, adminId];
        await pool.query(updateQuery, updateValues);
      }
    } catch (error) {
      // console.error("Error uploading files:", error);
      return res
        .status(500)
        .json({ message: "Error uploading files", error: error.message });
    }

    res.status(201).json({
      message: "ADMIN created successfully",
      adminId: adminId,
    });
  } catch (error) {
    // console.error("Error creating admin:", error);
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const adminData = {
      name: req.body.name,
      dob: req.body.dob,
      age: req.body.age,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      role: req.body.role === "admin" ? "admin" : "agent",
      ...(req.body.password && { password: req.body.password }),
      confirm_password: req.body.confirm_password,
      status: req.body.status === "Active" ? "Active" : "Inactive",
    };

    const query = `
      UPDATE ADMIN SET
        name = ?, dob = ?, age = ?, email = ?, mobile = ?, address = ?, city = ?, state = ?, pincode = ?, role = ?,
        ${req.body.password ? "password = ?, " : ""}
        confirm_password = ?, status = ?
      WHERE id = ?
    `;

    const values = [
      adminData.name,
      adminData.dob,
      adminData.age,
      adminData.email,
      adminData.mobile,
      adminData.address,
      adminData.city,
      adminData.state,
      adminData.pincode,
      adminData.role,
      ...(req.body.password ? [adminData.password] : []),
      adminData.confirm_password,
      adminData.status,
      adminId,
    ];

    await pool.query(query, values);

    const folderPath = `Finance/ADMIN/${adminId}`;

    try {
      if (req.files && req.files.photo && req.files.photo.length > 0) {
        adminData.photo = await uploadFileToSpaces(
          req.files.photo[0],
          `${folderPath}/photo`
        );

        const updatePhotoQuery = `UPDATE ADMIN SET photo = ? WHERE id = ?`;
        const updatePhotoValues = [adminData.photo, adminId];
        await pool.query(updatePhotoQuery, updatePhotoValues);
      }
    } catch (error) {
      // console.error("Error uploading files:", error);
      return res
        .status(500)
        .json({ message: "Error uploading files", error: error.message });
    }

    res.status(200).json({
      message: "ADMIN updated successfully",
      id: adminId,
    });
  } catch (error) {
    // console.error("Error updating admin:", error);
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    const [result] = await adminModel.deleteAdmin(adminId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ADMIN not found" });
    }

    res.status(200).json({ message: "ADMIN deleted successfully" });
  } catch (error) {
    // console.error("Error deleting admin:", error);
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

const getSuperAdminQrCodes = async (req, res) => {
  try {
    const [records] = await pool.query('SELECT id, qr_code FROM ADMIN WHERE is_super_admin = ?', ['yes']);

    if (records.length === 0) {
      return res.status(404).json({ message: "No super admin records found." });
    }

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
      records.map(async (loan) => ({
        ...loan,
        qr_code: await generatePresignedUrl(loan, "qr_code"),
      }))
    );

    res.status(200).json({
      message: "Super admin qr_code records fetched successfully.",
      data: resultsWithUrls,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching qr_code records", error: error.message });
  }
};

const updateQrCode = async (req, res) => {
  try {
    const adminId = req.params.id;
    const [adminResult] = await pool.query('SELECT is_super_admin FROM ADMIN WHERE id = ?', [adminId]);
    const admin = adminResult[0];
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isSuperAdmin = admin.is_super_admin === 'yes';
    if (!isSuperAdmin) {
      return res.status(403).json({ message: "Only super admins can update the QR code." });
    }
    if (!req.files || !req.files.qr_code || req.files.qr_code.length === 0) {
      return res.status(400).json({ message: "QR Code file is required." });
    }
    const qrCodeFile = req.files.qr_code[0];
    if (!qrCodeFile.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: "Invalid QR Code format. Only image files are allowed." });
    }
    const folderPath = `Finance/ADMIN/${adminId}/qr_code`;
    const qrCodeUrl = await uploadFileToSpaces(qrCodeFile, folderPath);
    const updateQrCodeQuery = `UPDATE ADMIN SET qr_code = ? WHERE id = ?`;
    await pool.query(updateQrCodeQuery, [qrCodeUrl, adminId]);
    res.status(200).json({
      message: "QR Code updated successfully",
      qr_code: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error updating QR Code:", error);
    res.status(500).json({ message: "Error updating QR Code", error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const query = "SELECT * FROM ADMIN";
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
        photo: await generatePresignedUrl(loan, "photo"),
        qr_code: await generatePresignedUrl(loan, "qr_code"),
      }))
    );
    res.status(200).json(resultsWithUrls);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const adminId = req.params.id;

    const query = `SELECT * FROM ADMIN WHERE id = ?`;
    const [[admin]] = await pool.query(query, [adminId]);

    if (!admin) {
      return res.status(404).json({ message: "ADMIN not found" });
    }

    const generatePresignedUrl = async (field) => {
      if (!admin[field]) return null;

      const link = admin[field];
      const fileName = link.split("/").pop();
      const pathParts = link.split("/");
      const filePath = pathParts.slice(3, -1).join("/") + "/";

      return `${req.protocol}://${req.get(
        "host"
      )}/fetch-image?filePath=${encodeURIComponent(
        filePath
      )}&fileName=${encodeURIComponent(fileName)}`;
    };

    const result = {
      ...admin,
      photo: await generatePresignedUrl("photo"),
    };

    res.json(result);
  } catch (error) {
    console.error("Error retrieving admin data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await adminModel.getAdminByEmailAndPassword(email, password);

    if (!rows.length) {
      return res
        .status(404)
        .json({ message: "ADMIN not found or invalid credentials" });
    }

    const admin = rows[0];
    if (admin.status === "Inactive") {
      return res
        .status(403)
        .json({ message: "Account is Inactive. Please contact support." });
    }

    const token = jwt.sign({ userId: admin.id }, JWT_SECRET, {
      expiresIn: "10d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    res.setHeader("Authorization", `Bearer ${token}`);

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error.code === "ECONNRESET") {
      return res
        .status(500)
        .json({ message: "Database connection was lost. Please try again." });
    }
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const logout = (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    tokenBlacklist.add(token);
  }

  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.setHeader("Authorization", "");

  res.status(200).json({ message: "Logout successful" });
};

const getAdminByRole = async (req, res) => {
  try {
    const { role } = req.params; 

    const validRoles = ['admin', 'agent'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const query = `SELECT id, name, email, role FROM ADMIN WHERE role = ?`;
    const [rows] = await pool.query(query, [role]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No admins found for this role." });
    }

    res.status(200).json(rows); 
  } catch (error) {
    // console.error("Error fetching admins by role:", error);
    res.status(500).json({ message: "Error fetching admins by role", error: error.message });
  }
};

const getAdminsByAdminId = (req, res) => {
  const { adminId, role } = req.params;

  if (role === 'agent') {
    HomeLoanModel.getAdminsByAdminId(adminId)
      .then((loans) => res.json(loans))
      .catch((err) => res.status(500).json({ message: "Error fetching home loans by admin ID", error: err }));
  } else if (role === 'admin') {
    getAllAdmins(req, res); 
  } else {
    res.status(403).json({ message: "Unauthorized role" });
  }
};

const getAdminByMobile = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    
    const query = "SELECT id,mobile FROM ADMIN WHERE mobile = ?";
    
    const [results] = await pool.query(query, [mobile]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No ADMIN found for this mobile number" });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching ADMIN by mobile",
      error: error.message,
    });
  }
};

const getAgentsByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const validRoles = ['admin', 'agent'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (role === 'agent') {
      const query = `SELECT id, name FROM ADMIN WHERE role = 'agent'`; 
      const [rows] = await pool.query(query);

      if (rows.length === 0) {
        return res.status(404).json({ message: "No agents found." });
      }

      return res.status(200).json(rows);
    } else {
      return res.status(400).json({ message: "Invalid role for this endpoint." });
    }
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Error fetching agents", error: error.message });
  }
};



module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  login,
  logout,
  getAdminByRole,
  getAdminsByAdminId,
  tokenBlacklist,
  getAdminByMobile,
  getAgentsByRole,
  getSuperAdminQrCodes,
  updateQrCode
};
