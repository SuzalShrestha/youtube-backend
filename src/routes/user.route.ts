import { Router } from "express";

import {
    changePassword,
    getCurrentUser,
    getUserChannel,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
} from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";
import { upload } from "../middlewares/mutler.middleware";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, upload.none(), changePassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router
    .route("/update-account-detail")
    .patch(verifyJWT, upload.none(), updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
    .route("/cover-image")
    .post(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:userName").get(verifyJWT, getUserChannel);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
