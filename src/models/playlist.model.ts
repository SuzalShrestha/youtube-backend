import mongoose, { Schema } from "mongoose";

import { PlaylistType } from "../schemas/playlist.schema";

const playlistSchema = new Schema<PlaylistType>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);
export const Playlist = mongoose.model("Playlist", playlistSchema);
