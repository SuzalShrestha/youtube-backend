import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

//routes import
import userRouter from "./routes/user.route";

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
export { app };
