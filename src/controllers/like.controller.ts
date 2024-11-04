import { Request, Response } from "express";

import { Like } from "../models/like.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const userId = req.user?._id;
    if (!videoId) {
        throw new ApiError(400, "Video Id Required");
    }
    const like = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });

    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({
            video: videoId,
            likedBy: userId,
        });
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Like Toggled Successfull", {}));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment Id Required");
    const userId = req.user?._id;
    const like = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });
    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Like Toggle Successful", {}));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) throw new ApiError(400, "Tweet Id Required");
    const userId = req.user?._id;
    const like = await Like.findOne({ tweet: tweetId, likedBy: userId });
    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Like Toggle Successful", {}));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const likes = await Like.find({ likedBy: userId }).populate("video");
    if (!likes) throw new ApiError(404, "No Likes Found");
    return res
        .status(200)
        .json(new ApiResponse(200, "Liked Videos Fetched Successful", likes));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
