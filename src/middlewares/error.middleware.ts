import { ErrorRequestHandler } from "express";

import ApiError from "../utils/api.error";

const errorHandler: ErrorRequestHandler = (err: ApiError, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.statusCode || 500,
        message: err.message,
    });
};
export default errorHandler;
