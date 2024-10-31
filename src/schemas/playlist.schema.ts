import { UserType } from "./user.schema";
import { VideoType } from "./video.schema";

export interface PlaylistType {
    name: string;
    description: string;
    videos: VideoType[];
    owner: UserType;
}
