import { IObjectId, TObjectId } from "../types/express";

export interface TSubscription extends IObjectId {
    channel: TObjectId;
    subscriber: TObjectId;
}
