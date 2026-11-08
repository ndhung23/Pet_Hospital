
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const petRoutes = require("./routes/petRoutes");

app.use("/api/pets", petRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "PHMS Backend is running!"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
                "SELECT current_database() AS database, NOW() AS time"
                );

        res.json({
            success: true,
            message: "PostgreSQL connected successfully!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed!"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

