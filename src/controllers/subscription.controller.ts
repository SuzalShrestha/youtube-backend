import mongoose from "mongoose";

import { Subscription } from "../models/subscription.model";
import { User } from "../models/user.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(200, "Channel Id Required");
    //for security reason
    const channelExists = await User.findById(channelId); //channel is also a user
    if (!channelExists) {
        return res.status(404).json(new ApiError(404, "Channel Not Found"));
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });
    if (isSubscribed) {
        const subscription = await Subscription.findByIdAndDelete(
            isSubscribed._id
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Channel Unsubscribed Successfully",
                    subscription
                )
            );
    } else {
        const subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Channel Subscribed Successfully",
                    subscription
                )
            );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(400, "Channel Id Required");
    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
            },
        },
    ]);
    if (!subscription) throw new ApiError(400, "Invalid Channel Id");
    return res
        .status(200)
        .json(new ApiResponse(200, "Subscriber Fetched", subscription));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!subscriberId) throw new ApiError(400, "Subscriber Id Required");
    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
            },
        },
    ]);
    if (!subscription) throw new ApiError(400, "Invalid Subscriber Id");
    return res
        .status(200)
        .json(new ApiResponse(200, "Channel Fetched", subscription));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
