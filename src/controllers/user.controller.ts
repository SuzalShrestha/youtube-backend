import { Request, Response } from "express";

import { User } from "../models/user.model";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import ApiError from "../utils/error.handler";

type avatar = {
    [fieldname: string]: Express.Multer.File[];
};
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    //get user from frontend
    //validate the data
    //check if user exist : username and email
    //check for images and avatar
    //upload to cloudinary
    //check if success
    //create user obj to store to db
    //remove password and access token from response
    //check for user creation
    //return responses
    const { fullName, email, password, userName } = req.body;
    console.log(fullName, email, password, userName);
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
    if (existingUser) {
        throw new ApiError(
            409,
            "User with same email or username already exists"
        );
    }
    const files = req.files as avatar;
    const avatarLocalPath = files?.avatar?.[0]?.path;
    const coverImageLocalPath = files?.coverImage?.[0]?.path; //cover image is optional
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        coverImage: coverImage?.url || "",
        avatar: avatar?.url,
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "Cannot create user");
    }
    res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    );
});
export { registerUser };
