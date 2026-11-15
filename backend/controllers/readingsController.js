
const pool = require("../config/db");

const VALID_SLOTS = [
    "Morning (fasting)",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// Validate a date in YYYY-MM-DD format.
const isValidDate = (date) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsed = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
};

// Get today's date using the server's local timezone.
const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Validate the reading fields shared by add and update.
const validateReading = (reading_date, time_slot, glucose_value) => {
    if (
        glucose_value === undefined ||
        glucose_value === null ||
        glucose_value === ""
    ) {
        return "Please enter a glucose value.";
    }

    const value = Number(glucose_value);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
        return "Value must be between 40 and 600 mg/dl.";
    }

    if (!reading_date) {
        return "Please select a reading date.";
    }

    if (!isValidDate(reading_date)) {
        return "Please enter a valid date.";
    }

    if (reading_date > getTodayDate()) {
        return "Date cannot be in the future.";
    }

    if (!VALID_SLOTS.includes(time_slot)) {
        return "Please select a valid time slot.";
    }

    return null;
};

// Return a grammatically correct duplicate-slot message.
const getDuplicateMessage = (timeSlot) => {
    return `You already have a ${timeSlot} reading for this date.`;
};

// Run database operations safely inside a transaction.
const runTransaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Lock one user's selected date during add/update operations.
// This prevents concurrent requests from exceeding four readings.
const lockUserDate = async (client, userId, readingDate) => {
    await client.query(
        `SELECT pg_advisory_xact_lock(
            hashtext($1::text),
            hashtext($2::text)
        )`,
        [userId, readingDate]
    );
};

// Add a glucose reading
const addReading = async (req, res) => {
    try {
        const { reading_date, time_slot, glucose_value } = req.body;
        const userId = req.user.userId;

        const validationError = validateReading(
            reading_date,
            time_slot,
            glucose_value
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const value = Number(glucose_value);

        const reading = await runTransaction(async (client) => {
            // Serialize changes for this user and date.
            await lockUserDate(client, userId, reading_date);

            // Check duplicate slot first.
            const duplicate = await client.query(
                `SELECT id
                 FROM readings
                 WHERE user_id = $1
                 AND reading_date = $2
                 AND time_slot = $3`,
                [userId, reading_date, time_slot]
            );

            if (duplicate.rows.length > 0) {
                const error = new Error("DUPLICATE_SLOT");
                error.code = "DUPLICATE_SLOT";
                throw error;
            }

            // Check the maximum of four readings.
            const countResult = await client.query(
                `SELECT COUNT(*) AS count
                 FROM readings
                 WHERE user_id = $1
                 AND reading_date = $2`,
                [userId, reading_date]
            );

            if (Number(countResult.rows[0].count) >= 4) {
                const error = new Error("DAILY_LIMIT");
                error.code = "DAILY_LIMIT";
                throw error;
            }

            const result = await client.query(
                `INSERT INTO readings
                    (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, $2, $3, $4)
                 RETURNING
                    id,
                    TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                    time_slot,
                    glucose_value`,
                [userId, reading_date, time_slot, value]
            );

            return result.rows[0];
        });

        return res.status(201).json({
            message: "Glucose reading added successfully!",
            reading
        });

    } catch (error) {
        console.error("Add reading error:", error.message);

        if (error.code === "DUPLICATE_SLOT" || error.code === "23505") {
            return res.status(409).json({
                message: getDuplicateMessage(req.body.time_slot)
            });
        }

        if (error.code === "DAILY_LIMIT") {
            return res.status(400).json({
                message: "You can add only 4 readings per day."
            });
        }

        return res.status(500).json({
            message: "Server error while adding glucose reading."
        });
    }
};

// Get all glucose readings for the logged-in user
const getReadings = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                id,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                glucose_value,
                created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, id DESC`,
            [userId]
        );

        return res.status(200).json({
            message: "Glucose readings retrieved successfully!",
            totalReadings: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error.message);

        return res.status(500).json({
            message: "Server error while retrieving readings."
        });
    }
};

// Update an existing glucose reading
const updateReading = async (req, res) => {
    try {
        const userId = req.user.userId;
        const readingId = req.params.id;

        const { reading_date, time_slot, glucose_value } = req.body;

        if (!/^\d+$/.test(readingId) || Number(readingId) <= 0) {
            return res.status(400).json({
                message: "Invalid reading ID."
            });
        }

        const validationError = validateReading(
            reading_date,
            time_slot,
            glucose_value
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const value = Number(glucose_value);

        const reading = await runTransaction(async (client) => {
            // Confirm that the reading belongs to this user.
            const currentReading = await client.query(
                `SELECT id
                 FROM readings
                 WHERE id = $1 AND user_id = $2`,
                [readingId, userId]
            );

            if (currentReading.rows.length === 0) {
                const error = new Error("READING_NOT_FOUND");
                error.code = "READING_NOT_FOUND";
                throw error;
            }

            // Lock the destination date to enforce the daily limit.
            await lockUserDate(client, userId, reading_date);

            // Check duplicate slot, excluding the current reading.
            const duplicate = await client.query(
                `SELECT id
                 FROM readings
                 WHERE user_id = $1
                 AND reading_date = $2
                 AND time_slot = $3
                 AND id != $4`,
                [userId, reading_date, time_slot, readingId]
            );

            if (duplicate.rows.length > 0) {
                const error = new Error("DUPLICATE_SLOT");
                error.code = "DUPLICATE_SLOT";
                throw error;
            }

            // Check the destination date's reading count.
            // Exclude the reading currently being updated.
            const countResult = await client.query(
                `SELECT COUNT(*) AS count
                 FROM readings
                 WHERE user_id = $1
                 AND reading_date = $2
                 AND id != $3`,
                [userId, reading_date, readingId]
            );

            if (Number(countResult.rows[0].count) >= 4) {
                const error = new Error("DAILY_LIMIT");
                error.code = "DAILY_LIMIT";
                throw error;
            }

            const result = await client.query(
                `UPDATE readings
                 SET reading_date = $1,
                     time_slot = $2,
                     glucose_value = $3
                 WHERE id = $4 AND user_id = $5
                 RETURNING
                    id,
                    TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                    time_slot,
                    glucose_value`,
                [reading_date, time_slot, value, readingId, userId]
            );

            return result.rows[0];
        });

        return res.status(200).json({
            message: "Glucose reading updated successfully!",
            reading
        });

    } catch (error) {
        console.error("Update reading error:", error.message);

        if (error.code === "READING_NOT_FOUND") {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        if (error.code === "DUPLICATE_SLOT" || error.code === "23505") {
            return res.status(409).json({
                message: getDuplicateMessage(req.body.time_slot)
            });
        }

        if (error.code === "DAILY_LIMIT") {
            return res.status(400).json({
                message: "You can add only 4 readings per day."
            });
        }

        return res.status(500).json({
            message: "Server error while updating reading."
        });
    }
};

// Delete a glucose reading
const deleteReading = async (req, res) => {
    try {
        const userId = req.user.userId;
        const readingId = req.params.id;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [readingId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        return res.status(200).json({
            message: "Glucose reading deleted successfully!",
            deletedReadingId: result.rows[0].id
        });

    } catch (error) {
        console.error("Delete reading error:", error.message);

        return res.status(500).json({
            message: "Server error while deleting reading."
        });
    }
};

// Validate report date
const isValidReportDate = (date) => {
    return isValidDate(date);
};

// Get report summary
const getReportSummary = async (userId, startDate, endDate) => {
    const result = await pool.query(
        `SELECT
            MAX(glucose_value) AS highest,
            MIN(glucose_value) AS lowest,
            ROUND(AVG(glucose_value), 1) AS average,
            COUNT(*) AS total_readings
         FROM readings
         WHERE user_id = $1
         AND reading_date BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
    );

    const summary = result.rows[0];

    return {
        highest: summary.highest === null ? null : Number(summary.highest),
        lowest: summary.lowest === null ? null : Number(summary.lowest),
        average: summary.average === null ? null : Number(summary.average),
        totalReadings: Number(summary.total_readings)
    };
};

// Daily report
const getDailyReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const selectedDate = req.query.date;

        if (!isValidReportDate(selectedDate)) {
            return res.status(400).json({
                message: "Please provide a valid date using YYYY-MM-DD."
            });
        }

        const readingsResult = await pool.query(
            `SELECT
                id,
                TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                time_slot,
                glucose_value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE time_slot
                    WHEN 'Morning (fasting)' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [userId, selectedDate]
        );

        const summary = await getReportSummary(
            userId,
            selectedDate,
            selectedDate
        );

        return res.status(200).json({
            reportType: "Daily",
            date: selectedDate,
            summary,
            readings: readingsResult.rows,
            message: summary.totalReadings === 0
                ? "No readings found for this date."
                : "Daily report generated successfully."
        });

    } catch (error) {
        console.error("Daily report error:", error.message);

        return res.status(500).json({
            message: "Server error while generating daily report."
        });
    }
};

// Month-to-date report
const getMonthToDateReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const selectedDate = req.query.date;

        if (!isValidReportDate(selectedDate)) {
            return res.status(400).json({
                message: "Please provide a valid date using YYYY-MM-DD."
            });
        }

        const startDate = `${selectedDate.slice(0, 7)}-01`;

        const summary = await getReportSummary(
            userId,
            startDate,
            selectedDate
        );

        return res.status(200).json({
            reportType: "Month-to-date",
            startDate,
            endDate: selectedDate,
            summary,
            message: summary.totalReadings === 0
                ? "No readings found for this period."
                : "Month-to-date report generated successfully."
        });

    } catch (error) {
        console.error("Month-to-date report error:", error.message);

        return res.status(500).json({
            message: "Server error while generating month-to-date report."
        });
    }
};

// Previous full-month report
const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const selectedDate = req.query.date;

        if (!isValidReportDate(selectedDate)) {
            return res.status(400).json({
                message: "Please provide a valid date using YYYY-MM-DD."
            });
        }

        const currentMonthStart = new Date(
            `${selectedDate.slice(0, 7)}-01T00:00:00Z`
        );

        const previousMonthEnd = new Date(currentMonthStart);
        previousMonthEnd.setUTCDate(0);

        const previousMonthStart = new Date(previousMonthEnd);
        previousMonthStart.setUTCDate(1);

        const startDate = previousMonthStart.toISOString().slice(0, 10);
        const endDate = previousMonthEnd.toISOString().slice(0, 10);

        const summary = await getReportSummary(
            userId,
            startDate,
            endDate
        );

        return res.status(200).json({
            reportType: "Previous full month",
            startDate,
            endDate,
            summary,
            message: summary.totalReadings === 0
                ? "No readings found for the previous month."
                : "Monthly report generated successfully."
        });

    } catch (error) {
        console.error("Monthly report error:", error.message);

        return res.status(500).json({
            message: "Server error while generating monthly report."
        });
    }
};

module.exports = {
    addReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport
};
