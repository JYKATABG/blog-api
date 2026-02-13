import { pool } from "../config/db.js"
import { HttpError } from "../utils/HttpError.js";

export const findUserById = async (userId) => {
    const { rows } = await pool.query(`SELECT id, username, email FROM users WHERE id = $1`, [userId])

    return rows[0] ?? null;
}

export const paginateUsers = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM users`);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    if (page > totalPages && totalUsers > 0) {
        throw new HttpError(`Page ${page} does not exist. Total pages: ${totalPages}`, 400, "PAGE_NOT_EXIST")
    }

    const result = await pool.query(`
        SELECT id, email, username, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset])

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            currentPage: page,
            perPage: limit,
            totalUsers: totalUsers,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    });

}


export const getUserById = async (req, res) => {
    const { userId } = req.params;

    const user = await findUserById(userId)

    if (!user) {
        throw new HttpError('User not found', 404, "USER_NOT_FOUND")
    }

    res.status(200).json({ success: true, data: user })
}

// export const createUser = async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         const result = await pool.query(`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *`, [username, email, password])

//         res.status(200).json({
//             success: true,
//             message: "User created successfully",
//             data: result.rows[0]
//         })

//     } catch (error) {
//         console.error("Error creating user: ", error);
//         res.status(500).json({ success: false, error: "Server error" })
//     }
// }

export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;

    const user = await findUserById(userId);

    if (!user) {
        throw new HttpError("User not found", 404, "USER_NOT_FOUND");
    }

    const result = await pool.query("UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *", [username, email, userId])

    res.json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0]
    })
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    const user = await findUserById(userId);

    if (!user) {
        throw new HttpError("User not found", 404, "USER_NOT_FOUND");
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId])

    res.json({
        success: true,
        message: "User deleted successfully",
    })

}

export const searchUsers = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new HttpError("Search query 'q' is required", 400, "SEARCH_QUERY_REQUIRED")
    }

    const result = await pool.query(`
        SELECT id, email, username
        FROM users
        WHERE username ILIKE $1 OR email ILIKE $1`, [`%${q}%`])

    res.json({
        success: true,
        results: result.rows.length,
        data: result.rows
    })
}