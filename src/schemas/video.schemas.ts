import mongoose from "mongoose";

export interface VideoType {
    _id: mongoose.Types.ObjectId;
    videoFile: string;
    thumbnail: string;
    title: string;
    description: string;
    duration: number;
    views: number;
    isPublished: boolean;
    owner: mongoose.Types.ObjectId;
}
