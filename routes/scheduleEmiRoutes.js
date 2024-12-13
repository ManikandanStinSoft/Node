const express = require("express");
const router = express.Router();
const protect = require("../middleware/generateToken");
const upload = require("../utils/upload")
const scheduleEmiController =require("../controllers/scheduleEmiController")

router.get("/", protect, scheduleEmiController.getAllScheduleEmis);

router.get("/admin/:adminId/:role/:adminName", protect, scheduleEmiController.getScheduleEmiByAdminId);

router.get("/:form_id", protect, scheduleEmiController.getScheduleEmiById);

router.post("/auto-emi/month", scheduleEmiController.createMonthAutoSchedules);

router.post("/auto-emi/week", scheduleEmiController.createWeekAutoSchedules);

router.post("/auto-emi/day", scheduleEmiController.createDailyAutoSchedules);

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]), 
  scheduleEmiController.createScheduleEmi
);

router.put("/:form_id",protect,
  upload.fields([{ name: "image", maxCount: 1 }]), 
  scheduleEmiController.updateScheduleEmi
);

router.delete("/:form_id", protect, scheduleEmiController.deleteScheduleEmi);

router.post('/:form_id/manual/:approved_amount/:terms/:interest_amount',scheduleEmiController.createManualEmi);

router.post('/:form_id/single-manual/:approved_amount/:terms/:interest_amount/:emi_schedule', scheduleEmiController.createSingleManualEmi);

router.get('/:form_id/single-manual',scheduleEmiController.getAllSingleManualByid);

router.get('/:form_id/paid',scheduleEmiController.getManualSchedulePaidRecords);

router.get('/:form_id/unpaid',scheduleEmiController.getManualScheduleUnPaidRecords);

router.get('/:form_id/single-manual/home-loans', scheduleEmiController.fetchHomeLoansByScheduleEmiCondition);

router.get('/:form_id/single-manual/personal-loans', scheduleEmiController.fetchPersonalLoansByScheduleEmiCondition);

router.get('/manual-emi/paid/today', scheduleEmiController.fetchEmiPaidAmountsToday);

router.get('/manual-emi/paid/yesterday', scheduleEmiController.fetchEmiPaidAmountsYesterday);

router.get('/manual-emi/paid/date-range', scheduleEmiController.fetchEmiPaidAmountsByDateRange);

router.get(
  '/manual-emi/paid/range/:adminId/:adminName',
  scheduleEmiController.fetchEmiPaidAmountsByDateRangeAndAdmin
);  

router.get('/manual-emi/paid/last7days', scheduleEmiController.fetchEmiPaidAmountsLast7Days);

router.get('/manual-emi/paid/last30days', scheduleEmiController.fetchEmiPaidAmountsLast30Days);

router.get('/manual-emi/paid/thisyear', scheduleEmiController.fetchEmiPaidAmountsThisYear);

router.get('/emi-paid-amounts/today/:adminId/:adminName', scheduleEmiController.fetchEmiPaidAmountsByAdminToday);

router.get('/emi-paid-amounts/yesterday/:adminId/:adminName', scheduleEmiController.fetchEmiPaidAmountsByAdminYesterday);

router.get('/emi-paid-amounts/last7days/:adminId/:adminName', scheduleEmiController.fetchEmiPaidAmountsByAdminLast7Days);

router.get('/emi-paid-amounts/last30days/:adminId/:adminName', scheduleEmiController.fetchEmiPaidAmountsByAdminLast30Days);

router.get('/emi-paid-amounts/thisyear/:adminId/:adminName', scheduleEmiController.fetchEmiPaidAmountsByAdminThisYear);

router.get('/paid/:id',scheduleEmiController.getPaidScheduleById);

router.put("/update/:id", protect, scheduleEmiController.UpdateScheduleById);


module.exports = router;
