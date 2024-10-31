import mongoose from "mongoose";

import { SubscriptionType } from "../schemas/subscription.schema";

const subscriptionSchema = new mongoose.Schema<SubscriptionType>(
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
