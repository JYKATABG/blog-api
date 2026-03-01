import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { HttpError } from "../utils/HttpError.js";

export const register = async (req, res) => {

    const { username, email, password } = req.body;

    const userExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (userExists.rows.length > 0) {
        throw new HttpError("User already exists", 409, "USER_EXISTS")
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3) RETURNING id, username, email, created_at, role`,
        [username, email, passwordHash])

    const user = result.rows[0];

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(200).json({
        success: true,
        message: "User created successfully",
        user,
        token
    })
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
        throw new HttpError("Invalid credentials", 400, "INVALID_CREDENTIALS")
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
        throw new HttpError("Invalid credentials", 400, "INVALID_CREDENTIALS")
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
        success: true,
        message: "Logged in successfully",
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        token
    })
}