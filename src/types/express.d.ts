import mongoose from "mongoose";

import { UserMethods, UserType } from "../schemas/user.schemas";

declare module "express-serve-static-core" {
    interface Request {
        user: UserType & UserMethods;
        files?: { [key: string]: Express.Multer.File[] };
        file?: Express.Multer.File;
    }
}

export type MFiles = { [key: string]: Express.Multer.File[] };
export type MObjectId = mongoose.Types.ObjectId;
export type TDeAccessToken = {
    _id: mongoose.Types.ObjectId;
    userName: string;
    email: string;
    fullName: string;
};
export type TDeRefreshToken = {
    _id: mongoose.Types.ObjectId;
};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            MONGODB_URI: string;
            CORS_ORIGIN: string;
            ACCESS_TOKEN_SECRET: string;
            ACCESS_TOKEN_EXPIRY: string;
            REFRESH_TOKEN_SECRET: string;
            REFRESH_TOKEN_EXPIRY: string;
            CLOUDINARY_CLOUD_NAME: string;
            CLOUDINARY_API_KEY: string;
            CLOUDINARY_API_SECRET: string;
        }
    }
}
export interface IObjectId {
    _id: mongoose.Types.ObjectId;
}
export type TObjectId = mongoose.Types.ObjectId;
