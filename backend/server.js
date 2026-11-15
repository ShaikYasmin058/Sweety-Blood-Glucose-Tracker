
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const readingsRoutes = require("./routes/readingsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/readings", readingsRoutes);
app.use("/api/auth", authRoutes);

// Welcome API
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Sweety Blood Glucose Tracker API!"
    });
});

// PostgreSQL connection test API
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        res.status(200).json({
            message: "PostgreSQL connection successful!",
            database: "sweety_db",
            currentTime: result.rows[0].current_time
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            message: "Database connection failed."
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sweety server running on port ${PORT}`);
});
