import { Request, Response } from "express";

import { asyncHandler } from "../utils/async.handler";
import ApiError from "../utils/error.handler";

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
    res.json({
        message: "OK",
    });
});
export { registerUser };
