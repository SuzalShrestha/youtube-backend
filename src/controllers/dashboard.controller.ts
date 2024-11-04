import { Like } from "../models/like.model";
import { Subscription } from "../models/subscription.model";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const videos = await Video.find({ owner: userId }).countDocuments();
    const subscribers = await Subscription.find({
        channel: userId,
    }).countDocuments();
    const likes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $match: {
                "video.owner": userId,
            },
        },
        {
            $count: "totalLikes",
        },
    ]);
    return res.status(200).json(
        new ApiResponse(200, "Channel Stats Fetched Successfully", {
            videos,
            subscribers,
            likes,
        })
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const videos = await Video.find({ owner: userId });
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Channel Videos Fetched Successfully", videos)
        );
});

export { getChannelStats, getChannelVideos };
