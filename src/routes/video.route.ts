import { Router } from "express";

import { uploadVideo } from "../controllers/video.controller";
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
export default router;
