import { Request, Response } from "express";

import { Comment } from "../models/comment.model";
import { Like } from "../models/like.model";
import { Tweet } from "../models/tweet.model";
import { Video } from "../models/video.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully", {}));
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Video liked successfully", {}));
});

const toggleCommentLike = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment id is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Comment unliked successfully", {}));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment liked successfully", {}));
});

const toggleTweetLike = asyncHandler(async (req: Request, res: Response) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet unliked successfully", {}));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet liked successfully", {}));
});

const getLikedVideos = asyncHandler(async (req: Request, res: Response) => {
    const likedVideos = await Like.find({
        likedBy: req.user?._id,
        video: { $exists: true },
    }).populate("video");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Liked videos fetched successfully",
                likedVideos
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
