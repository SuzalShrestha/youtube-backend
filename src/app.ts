import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import errorHandler from "./middlewares/error.middleware";
//routes import
import subscriptionRouter from "./routes/subscription.route";
import userRouter from "./routes/user.route";
import videoRouter from "./routes/video.route";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(
    express.json({
        limit: "16kb",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);
app.use(cookieParser());

//routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use(errorHandler);
export { app };
