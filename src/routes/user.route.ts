import { Router } from "express";

import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
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
export default router;
