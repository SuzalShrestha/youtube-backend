import { NextFunction, Request, Response } from "express";
import fs from "fs";

import { User } from "../models/user.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";
import { uploadOnCloudinary } from "../utils/cloudinary";

type avatar = {
    [fieldname: string]: Express.Multer.File[];
};
const removeFiles = (files: avatar) => {
    try {
        fs.unlinkSync(files?.avatar[0]?.path);
        fs.unlinkSync(files?.coverImage[0]?.path);
    } catch (error) {
        console.error("Error removing files:", error);
    }
};
const registerUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { fullName, email, password, userName } = req.body;
            if (
                [fullName, email, password, userName].some((el: string) => {
                    return el?.trim() === "";
                })
            ) {
                throw new ApiError(400, "All fields are required");
            }
            const existingUser = await User.findOne({
                $or: [{ userName }, { email }],
            });
            const files = req.files as avatar;
            if (existingUser) {
                throw new ApiError(
                    409,
                    "User with same email or username already exists"
                );
            }
            const avatarLocalPath = files?.avatar[0]?.path;
            const coverImageLocalPath = files?.coverImage[0]?.path; //cover image is optional
            if (!avatarLocalPath) {
                throw new ApiError(400, "Avatar is required");
            }
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            const coverImage = await uploadOnCloudinary(coverImageLocalPath);
            if (!avatar) {
                throw new ApiError(400, "Avatar file upload cloudinary failed");
            }
            const user = await User.create({
                fullName,
                email,
                password,
                userName: userName,
                coverImage: coverImage?.url || "",
                avatar: avatar?.url,
            });
            const createdUser = await User.findById(user?._id).select(
                "-password -refreshToken"
            );
            if (!createdUser) {
                throw new ApiError(500, "Cannot create user");
            }
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        "User registered successfully",
                        createdUser
                    )
                );
        } catch (err) {
            return next(err);
        } finally {
            removeFiles(req.files as avatar);
        }
    }
);
export { registerUser };
