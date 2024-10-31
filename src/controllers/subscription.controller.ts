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

export { toggleSubscription };
