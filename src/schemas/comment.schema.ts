import { UserType } from "./user.schema";
import { VideoType } from "./video.schema";

export interface CommentType {
    content: string;
    video: VideoType;
    owner: UserType;
}
