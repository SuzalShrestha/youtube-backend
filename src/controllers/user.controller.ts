import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import fs from "fs";

import { User } from "../models/user.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";
import { uploadOnCloudinary } from "../utils/cloudinary";

type coverImageType = {
    [fieldname: string]: Express.Multer.File[];
};
type avatar = {
    [fieldname: string]: Express.Multer.File[];
};
const generateAccessAndRefreshToken = async (user_id: string) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            throw new ApiError(500, "User not found");
        }
        //@ts-ignore
        const accessToken = user.getAccessToken();
        console.log(accessToken);
        //@ts-ignore
        const refreshToken = user.getRefreshToken();
        console.log(refreshToken);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something went wrong with generating tokens");
    }
};
const removeFiles = (files: avatar) => {
    try {
        fs.unlinkSync(files?.avatar[0]?.path);
        fs.unlinkSync(files?.coverImage[0]?.path);
    } catch (error) {
        console.error("Error removing files:", error);
    }
    // console.log("removing files");
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
            const avatarLocalPath = files?.avatar?.[0]?.path;
            if (!avatarLocalPath) {
                throw new ApiError(400, "Avatar is required");
            }
            let coverImageLocalPath;
            if (
                req.files &&
                //@ts-ignore
                Array.isArray(req.files.coverImage) &&
                //@ts-ignore
                req.files.coverImage.length > 0
            ) {
                //@ts-ignore
                coverImageLocalPath = req.files.coverImage[0].path;
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
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password } = req.body;
    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }],
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    //@ts-ignore
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        //@ts-ignore
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged In Success", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        );
});
export { registerUser, loginUser };
