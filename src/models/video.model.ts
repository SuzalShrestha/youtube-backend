import mongoose, { Schema } from "mongoose";

// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { VideoType } from "../schemas/video.schema";

const videoSchema = new Schema<VideoType>(
    {
        videoFile: {
            type: String, //cloudinary
            required: true,
        },
        thumbnail: {
            type: String, //cloudinary
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, //cloudinary
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);
export const Video = mongoose.model("Video", videoSchema);
