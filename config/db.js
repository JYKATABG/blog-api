import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
});

async function verifyConnection() {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to PostgreSQL database");
        client.release();
    } catch (error) {
        console.error("❌ Error connecting to the database:", error);
    }
}

verifyConnection();