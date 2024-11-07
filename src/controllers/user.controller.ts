import { NextFunction, Request, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User } from "../models/user.model";
import { MFiles, MObjectId, TDeRefreshToken } from "../types/express";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";
import { uploadOnCloudinary } from "../utils/cloudinary";

const generateAccessAndRefreshToken = async (user_id: MObjectId) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            throw new ApiError(500, "User not found");
        }

        const accessToken = user.getAccessToken();

        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch {
        throw new ApiError(500, "Something went wrong with generating tokens");
    }
};

const removeFiles = (files: MFiles | undefined) => {
    try {
        console.log("Removing files");
        if (!files) throw new ApiError(500, "Error Removing Files");
        if (fs.existsSync(files?.avatar[0]?.path)) {
            fs.unlinkSync(files?.avatar[0]?.path);
        }
        if (fs.existsSync(files?.coverImage[0]?.path)) {
            fs.unlinkSync(files?.coverImage[0]?.path);
        }
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
            const files = req.files;
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
                Array.isArray(req.files.coverImage) &&
                req.files.coverImage.length > 0
            ) {
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
            removeFiles(req.files);
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
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
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

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
    if (!user) throw new ApiError(400, "Invalid token");
    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User Logged Out", {}));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized Access");
    }
    try {
        const decodedData = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        );
        if (!decodedData) {
            throw new ApiError(400, "Invalid Token");
        }
        const user = await User.findById((decodedData as TDeRefreshToken)?._id);
        if (!user) throw new ApiError(400, "User Not Found");
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Invalid Token");
        }
        const { refreshToken, accessToken } =
            await generateAccessAndRefreshToken(user?._id);
        const options = {
            httpOnly: true,
            secure: true,
        };
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "Access Token Refreshed ", {
                    accessToken,
                    refreshToken,
                })
            );
    } catch (error) {
        if (error instanceof Error)
            throw new ApiError(500, error?.message || "Invalid Token");
    }
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { newPassword, oldPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(400, "Invalid Token");

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid Password");
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, "Passsword Changed Successfully", {}));
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?._id;
    if (!userId) throw new ApiError(400, "Invalid User");
    const user = await User.findById(userId).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, "User Found", user));
});

const updateAccountDetails = asyncHandler(
    async (req: Request, res: Response) => {
        const { fullName, email } = req.body;
        console.log(fullName, email);
        if (!(fullName || email)) {
            throw new ApiError(400, "All Fields Are Required");
        }

        const userId = req?.user?._id;
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullName,
                    email,
                },
            },
            {
                new: true,
            }
        ).select("-password -refreshTokens");
        return res
            .status(200)
            .json(
                new ApiResponse(200, "User Details Updated Successfully", user)
            );
    }
);

const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar required");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) throw new ApiError(500, "Error Uploading To Cloudinary");
    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: {
                avatar: avatar?.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar Updated Successfully", user));
});

const updateCoverImage = asyncHandler(async (req: Request, res: Response) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new ApiError(400, "Avatar required");
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.url)
        throw new ApiError(500, "Error Uploading To Cloudinary");
    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set: {
                coverImage: coverImage?.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, "Cover Image Updated Successfully", user));
});

const getUserChannel = asyncHandler(async (req: Request, res: Response) => {
    const { userName } = req.params;
    console.log(userName);
    if (!userName?.trim()) {
        throw new ApiError(400, "Username Is Required");
    }
    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req?.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);
    if (!channel?.length) {
        throw new ApiError(404, "Channel Not Found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Channel Fetched Successfully", channel[0]));
});

const getWatchHistory = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req?.user?._id) },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        avatar: 1,
                                        userName: 1,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);
    if (!user || user.length === 0 || !user[0].watchHistory)
        throw new ApiError(500, "User Not Found");
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Watch History fetched", user[0].watchHistory)
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannel,
    getWatchHistory,
};
