const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../utils/upload");
const protect = require("../middleware/generateToken");
const uploadPhoto = upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "qr_code", maxCount: 1 }
  ]);
router.get("/role/:role", protect, adminController.getAdminByRole);
router.get("/", protect, adminController.getAllAdmins);
router.post("/", uploadPhoto, protect, adminController.createAdmin);
router.get('/qr-codes', protect,  adminController.getSuperAdminQrCodes);
router.put("/:id", uploadPhoto, protect, adminController.updateAdmin);
router.put(
    '/:id/qr-code',
    uploadPhoto, protect, adminController.updateQrCode
  );
  router.post("/login", adminController.login);
router.post("/logout", adminController.logout);
router.delete("/:id", protect, adminController.deleteAdmin);
router.get("/:id", protect, adminController.getAdminById);
router.get("/by-mobile/:mobile", adminController.getAdminByMobile);
router.get("/agents/:role", adminController.getAgentsByRole);

module.exports = router;