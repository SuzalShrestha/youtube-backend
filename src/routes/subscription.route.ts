import { Router } from "express";

import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJWT);
router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
