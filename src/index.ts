import dotenv from "dotenv";

import { app } from "./app";
import { connectDB } from "./db/db.connect";

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT || 3000;
connectDB()
    .then(() => {
        console.log("Database connected");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}!`);
        });
    })
    .catch((err) => {
        console.log("Error connecting to database", err);
        throw new Error("Error connecting to database");
    });
