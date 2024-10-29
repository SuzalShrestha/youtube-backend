import { Request, Response } from "express";

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
        let response = await uploadOnCloudinary(thumbnailLocalPath);
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
export { uploadVideo };