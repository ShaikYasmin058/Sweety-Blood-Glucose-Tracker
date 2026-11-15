const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function seedDatabase() {
    try {
        const hashedPassword = await bcrypt.hash("Demo@12345", 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email)
             DO UPDATE SET
                name = EXCLUDED.name,
                password = EXCLUDED.password
             RETURNING id`,
            ["Sweety Demo", "demo@sweety.com", hashedPassword]
        );

        const userId = userResult.rows[0].id;

        const sampleReadings = [
            [userId, new Date(Date.now() - 2 * 86400000), "Morning (fasting)", 105],
            [userId, new Date(Date.now() - 86400000), "After breakfast", 135],
            [userId, new Date(), "Morning (fasting)", 110]
        ];

        for (const reading of sampleReadings) {
            await pool.query(
                `INSERT INTO readings
                 (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, reading_date, time_slot)
                 DO NOTHING`,
                reading
            );
        }

        console.log("Demo user and sample readings created successfully!");
        console.log("Demo email: demo@sweety.com");
        console.log("Demo password: Demo@12345");

    } catch (error) {
        console.error("Database seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seedDatabase();