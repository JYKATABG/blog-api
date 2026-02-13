import { HttpError } from "../utils/HttpError.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error: {
                message: err.message,
                code: err.code
            }
        })
    }

    console.error(err);

    return res.status(500).json({
        error: {
            message: "Internal server error"
        }
    })
}

export default errorHandler;