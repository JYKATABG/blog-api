import jwt from "jsonwebtoken"
import { HttpError } from "../utils/HttpError.js";

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError("Access denied. No token provided", 401, "FORBIDDEN");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new HttpError("Access denied. Invalid token format", 401, "FORBIDDEN");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            throw new HttpError("Invalid token payload", 401, "INVALID_TOKEN_PAYLOAD")
        }

        req.userId = decoded.userId;
        req.user = decoded;

        next();
    } catch (error) {

        if (error.name === "TokenExpiredError") {
            throw new HttpError("Token expired. Please login again", 401, "TOKEN_EXPIRED")
        }

        if (error.name === "JsonWebTokenError") {
            throw new HttpError("Invalid token", 401, "INVALID_TOKEN");
        }

        if (error instanceof HttpError) {
            return next(error);
        }

        return next(new HttpError("Authentication failed", 500, "AUTH_ERROR"));
    }

}

export default authenticate;