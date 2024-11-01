import { Request, Response } from "express";
import mongoose from "mongoose";

import { Video } from "../models/video.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";
import { uploadOnCloudinary } from "../utils/cloudinary";

const uploadVideo = asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;
    const videoLocalPath = req?.files?.video?.[0].path;
    const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) throw new ApiError(400, "Video Is Required");
    const videoResponse = await uploadOnCloudinary(videoLocalPath);

    let thumbnail; //thumbnail is optional
    if (!thumbnailLocalPath) {
        thumbnail = videoResponse?.url?.replace(
            "upload",
            "upload/f_jpg/g_auto,g_auto"
        );
    } else {
        const response = await uploadOnCloudinary(thumbnailLocalPath);
        thumbnail = response?.url;
    }

    if (!videoResponse) throw new ApiError(500, "Video Upload Failed");
    const video = await Video.create({
        videoFile: videoResponse.url,
        thumbnail,
        title,
        description,
        duration: videoResponse?.duration,
        owner: req?.user?._id,
    });
    if (!video) throw new ApiError(500, "Error Saving Video");
    res.status(200).json(
        new ApiResponse(200, "Video Upload Successfully", video)
    );
});

const getAllVideo = asyncHandler(async (req: Request, res: Response) => {
    const {
        page = "1",
        limit = "10",
        // query, //for searching using title or description
        sortBy = "duration",
        sortType = "asc",
        userId,
    } = req.query as { [key: string]: string };
    const sort: Record<string, 1 | -1> = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === "asc" ? 1 : -1;
    }
    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $sort: sort,
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        { $limit: parseInt(limit) },
    ]);
    return res.status(200).json(new ApiResponse(200, "Video Fetched", video));
});

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "UserId Required");
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(400, "No video Found");
    return res.status(200).json(new ApiResponse(200, "Video Fetched", video));
});

const updateVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;
    if (!(title || description || thumbnail))
        throw new ApiError(400, "All Fields are required");
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail,
        },
        {
            new: true,
        }
    );
    if (!video) throw new ApiError(400, "Video Not Found");
    return res.status(200).json(new ApiResponse(200, "Video Updated", video));
});

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "Video Id Required");
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) throw new ApiError(400, "Video Delete Failed");
    return res
        .status(200)
        .json(new ApiResponse(200, "Video Deleted Successfully", video));
});

const togglePublishStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const { videoId } = req.params;
        if (!videoId) throw new ApiError(400, "Video Delete Failed");
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: true,
                },
            },
            { new: true }
        );
        if (!video) throw new ApiError(400, "Video Not Found");
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Publish Status Toggle Successfull", video)
            );
    }
);

export {
    uploadVideo,
    getAllVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
