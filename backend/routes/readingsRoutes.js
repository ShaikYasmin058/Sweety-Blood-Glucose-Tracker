
const express = require("express");
const router = express.Router();

const {
    addReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport
} = require("../controllers/readingsController");

const authMiddleware = require("../middleware/authMiddleware");

// Protect all reading routes
router.use(authMiddleware);

// Reading CRUD
router.post("/", addReading);
router.get("/", getReadings);
router.put("/:id", updateReading);
router.delete("/:id", deleteReading);

// Reports
router.get("/reports/daily", getDailyReport);
router.get("/reports/month-to-date", getMonthToDateReport);
router.get("/reports/monthly", getMonthlyReport);

module.exports = router;
