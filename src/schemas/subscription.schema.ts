import { IObjectId, TObjectId } from "../types/express";

export interface SubscriptionType extends IObjectId {
    channel: TObjectId;
    subscriber: TObjectId;
}
