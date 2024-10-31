import { CommentType } from "./comment.schema";
import { TweetType } from "./tweet.schema";
import { UserType } from "./user.schema";
import { VideoType } from "./video.schema";

export interface LikeType {
    comment: CommentType;
    video: VideoType;
    likedBy: UserType;
    tweet: TweetType;
}
