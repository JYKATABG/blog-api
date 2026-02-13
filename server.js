import express from "express"
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import postRouter from "./routes/postRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import { HttpError } from "./utils/HttpError.js";
import rateLimit from "express-rate-limit";

const app = express();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests from this IP, please try again later",
        retryAfter: "15 mins"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: "Too many login attempts, please try again later",
        retryAfter: "10 mins"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
})

app.use(express.json());

app.use("/api", apiLimiter)

app.use("/api/auth", authLimiter, authRouter);

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.use((req, res, next) => {
    throw new HttpError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
})

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running");
})