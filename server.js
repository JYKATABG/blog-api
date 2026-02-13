import express from "express"
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import postRouter from "./routes/postRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import { HttpError } from "./utils/HttpError.js";

const app = express();

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

app.use((req, res, next) => {
    throw new HttpError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
})

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running");
})