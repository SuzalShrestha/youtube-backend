import { TObjectId } from "../types/express";

export interface TweetType {
    content: string;
    owner: TObjectId;
}
