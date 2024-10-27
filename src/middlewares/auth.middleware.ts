import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model";
import ApiError from "../utils/api.error";

const verifyJWT = async (
    req: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const token =
            req.cookies?.accessToken ||
            //@ts-ignore
            req?.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(400, "Authorization failed");
        //@ts-ignore
        const decodedToken = jwt.verify(
            token,
            //@ts-ignore
            process.env.ACCESS_TOKEN_SECRET
        );
        //@ts-ignore
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        //@ts-ignore
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(
            401,
            (error as Error)?.message || "Invalid access token"
        );
    }
};

export default verifyJWT;
