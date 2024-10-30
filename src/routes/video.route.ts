import { Router } from "express";

import {
    getAllVideo,
    getVideoById,
    uploadVideo,
} from "../controllers/video.controller";
import verifyJWT from "../middlewares/auth.middleware";
import { upload } from "../middlewares/mutler.middleware";

const router = Router();
router.route("/upload").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadVideo
);
router.route("/getAllVideo").get(getAllVideo);
router.route("/:videoId").get(getVideoById);
export default router;
