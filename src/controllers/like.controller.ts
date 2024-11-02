import { Request, Response } from "express";

import { Like } from "../models/like.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const toggleVideoLike = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    const like = await Like.findOne({ video: videoId, likedBy: userId });

    if (like) {
        await Like.findByIdAndDelete(like._id);
    } else {
        await Like.create({ video: videoId, likedBy: userId });
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Like toggled successfully", {}));
});
export { toggleVideoLike };
