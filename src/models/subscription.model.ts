import mongoose from "mongoose";

import { TSubscription } from "../schemas/subscription.schemas";

const subscriptionSchema = new mongoose.Schema<TSubscription>(
    {
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
