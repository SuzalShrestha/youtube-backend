import { Request, Response } from "express";

import { Tweet } from "../models/tweet.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const createTweet = asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body;

    if (!content || content?.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "Tweet created successfully", tweet));
});

const getUserTweets = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "username email")
        .sort("-createdAt");

    if (!tweets) {
        throw new ApiError(404, "No tweets found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweets fetched successfully", tweets));
});

const updateTweet = asyncHandler(async (req: Request, res: Response) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!content || content?.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

const deleteTweet = asyncHandler(async (req: Request, res: Response) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet deleted successfully", {}));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
