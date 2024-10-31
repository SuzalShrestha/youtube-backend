import { NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model";
import { TDeAccessToken } from "../types/express";
import ApiError from "../utils/api.error";
import { asyncHandler } from "../utils/async.handler";

const verifyJWT = asyncHandler(async (req: Request, _, next: NextFunction) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req?.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(400, "Authorization failed");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(
            (decodedToken as TDeAccessToken)?._id
        ).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(
            401,
            (error as Error)?.message || "Invalid access token"
        );
    }
});

export default verifyJWT;
