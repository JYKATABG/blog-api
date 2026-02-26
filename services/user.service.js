import * as userRepo from "../repositories/user.repository.js";
import { HttpError } from "../utils/HttpError.js";

export const paginateUsers = async (page, limit) => {
  const offset = (page - 1) * limit;

  const totalUsers = await userRepo.countUsers();
  const totalPages = Math.ceil(totalUsers / limit);

  if (page > totalPages && totalUsers > 0) {
    throw new HttpError(
      `Page ${page} does not exist. Total pages: ${totalPages}`,
      400,
      "PAGE_NOT_EXIST",
    );
  }

  const users = await userRepo.getPaginatedUsers(limit, offset);

  return {
    users,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalUsers: totalUsers,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getUserById = async (userId) => {
  const user = await userRepo.findUserById(userId);

  if (!user) {
    throw new HttpError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

export const updateUser = async (userId, username, email) => {
  const updated = await userRepo.updateUser(username, email, userId);

  if (!updated) {
    throw new HttpError("User not found", 404, "USER_NOT_FOUND");
  }

  return updated;
};

export const deleteUser = async (userId) => {
  const deleted = await userRepo.deleteUser(userId);

  if (!deleted) {
    throw new HttpError("User not found", 404, "USER_NOT_FOUND");
  }

  return deleted;
};

export const searchUsers = async (q) => {
  if (!q) {
    throw new HttpError(
      "Search query 'q' is required",
      400,
      "SEARCH_QUERY_REQUIRED",
    );
  }

  return await userRepo.searchUsers(q);
};

export const updateRole = async (role, userId, authUserId) => {
  const validRoles = ["guest", "user", "admin"];
  if (!validRoles.includes(role))
    throw new HttpError("Invalid role", 400, "INVALID_ROLE");

  const userRole = await userRepo.getUserRole(userId);

  if (!userRole) throw new HttpError("User not found", 404, "INVALID_ID");

  if (userRole === role) {
    throw new HttpError(
      `This user is already an ${userRole}`,
      400,
      "DUPLICATE_ROLE",
    );
  }

  const isSelfEdit = authUserId === parseInt(userId);
  const isDemotion = role !== "admin";

  if (isSelfEdit && isDemotion)
    throw new HttpError(
      "You can't remove your admin role",
      403,
      "CANNOT_SELF_DEMOTE",
    );

  return await userRepo.updateRole(role, userId);
};
