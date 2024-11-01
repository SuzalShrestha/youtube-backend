import { Request, Response } from "express";
import mongoose from "mongoose";

import { Playlist } from "../models/playlist.model";
import ApiError from "../utils/api.error";
import { ApiResponse } from "../utils/api.response";
import { asyncHandler } from "../utils/async.handler";

const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, videos } = req.body;
    if (!(name || description || videos))
        throw new ApiError(400, "Fields Required");
    const playlist = Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos,
    });
    if (!playlist) throw new ApiError(500, "Playlist Create Failed");
    res.status(200).json(
        new ApiResponse(200, "Playlist Create Success", playlist)
    );
});

const getUserPlaylists = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new ApiError(400, "User Id Required");
    const playlist = await Playlist.find({
        owner: new mongoose.Types.ObjectId(userId),
    });
    if (!playlist) throw new ApiError(400, "Invalid User Id");
    return res
        .status(200)
        .json(new ApiResponse(400, "Playlist Fetch Successful", playlist));
});

const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId } = req.params;
    if (!playlistId) throw new ApiError(400, "User Id Required");
    const playlist = await Playlist.find({
        _id: new mongoose.Types.ObjectId(playlistId),
    });
    if (!playlist) throw new ApiError(400, "Invalid Playlist Id");
    return res
        .status(200)
        .json(new ApiResponse(400, "User Playlist Fetch Successful", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId, videoId } = req.params;
    if (!(playlistId || videoId)) throw new ApiError(400, "Fields Required");
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: {
                    _id: new mongoose.Types.ObjectId(videoId),
                },
            },
        },
        {
            new: true,
            upsert: true,
        }
    );
    if (!playlist) throw new ApiError(400, "Playlist Not Found");
    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist Video Add Successfull", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!(playlistId || videoId)) throw new ApiError(400, "Fields Required");
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: {
                    _id: new mongoose.Types.ObjectId(videoId),
                },
            },
        },
        {
            new: true,
        }
    );
    if (!playlist) throw new ApiError(400, "Playlist Not Found");
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Playlist Video Delete Successfull", playlist)
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) throw new ApiError(400, "Field Are Required");
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) throw new ApiError(400, "Invalid Playlist Id");
    return res
        .status(200)
        .json(new ApiResponse(200, "Delete Playlist Successful", playlist));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description, videos, owner } = req.body;
    if (!(name || description || playlistId))
        throw new ApiError(400, "Fields Are Required");
    const playlist = await Playlist.findByIdAndUpdate({
        name,
        description,
        videos,
        owner,
    });
    if (!playlist) throw new ApiError(400, "Invalid Playlist Id");
    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist Update Successful", playlist));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
