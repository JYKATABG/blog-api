import * as userService from "../services/user.service.js";

export const paginateUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  const result = await userService.paginateUsers(page, limit);

  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  const user = await userService.getUserById(userId);

  res.status(200).json({ success: true, data: user });
};

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

  const result = await userService.updateUser(userId, username, email);

  res.json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  await userService.deleteUser(userId);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;

  const result = await userService.searchUsers(q);

  res.json({
    success: true,
    results: result.length,
    data: result,
  });
};

export const updateRole = async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;
  const authUserId = req.userId;

  const result = await userService.updateRole(role, userId, authUserId);

  res.json({
    success: true,
    message: "Role updated successfully",
    data: result,
  });
};
