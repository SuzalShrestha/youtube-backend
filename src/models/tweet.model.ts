import mongoose, { Schema } from "mongoose";

import { TweetType } from "../schemas/tweet.schema";

const tweetSchema = new Schema<TweetType>(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
