import mongoose from "mongoose";

export interface UserType {
    _id: mongoose.Types.ObjectId;
    userName: string;
    email: string;
    password: string;
    fullName: string;
    avatar: string;
    coverImage?: string;
    refreshToken?: string;
    watchHistory: mongoose.Types.ObjectId[];
}

export interface UserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    getAccessToken(): string;
    getRefreshToken(): string;
}
