import mongoose from "mongoose";

import { DB_NAME } from "../constants";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_NAME}`
        );
        console.log(
            `Connected to MongoDB: ${connectionInstance.connection.host}`
        );
    } catch (err) {
        const error = `Error connecting to MongoDB: ${err}`;
        console.error(error);
        process.exit(1);
    }
};
