import { Router } from "express";

import { loginUser, registerUser } from "../controllers/user.controller";
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
export default router;
