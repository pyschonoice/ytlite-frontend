// src/services/playlistApi.js
import { api } from "./api";

// Fetches ALL playlists owned by a specific user (can be current user or another user)
// This will be used by both Profile.jsx and AllUserPlaylists.jsx
export async function getUserPlaylists(userId) {
  const res = await api.get(`/playlist/user/${userId}`); // Maps to backend /api/v1/playlist/user/:userId
  return res.data;
}

// Fetches details for a SINGLE playlist by its ID (used on the Playlist Details page)
// Renamed from getPlaylistById to getPlaylist for consistency with frontend usage
export async function getPlaylist(playlistId) { // Maps to backend /api/v1/playlist/:playlistId
  const res = await api.get(`/playlist/${playlistId}`);
  return res.data;
}

export async function createPlaylist(data) {
  const res = await api.post("/playlist", data); // Maps to backend /api/v1/playlist (POST)
  return res.data;
}

export async function updatePlaylistDetails(playlistId, data) {
  const res = await api.patch(`/playlist/${playlistId}`, data); // Maps to backend /api/v1/playlist/:playlistId (PATCH)
  return res.data;
}

export async function deletePlaylist(playlistId) {
  const res = await api.delete(`/playlist/${playlistId}`); // Maps to backend /api/v1/playlist/:playlistId (DELETE)
  return res.data;
}

// These are actions to add/remove VIDEOS to/from a playlist
export async function addVideoToPlaylist(videoId, playlistId) {
  const res = await api.patch(`/playlist/add/${videoId}/${playlistId}`); // Maps to backend /api/v1/playlist/add/:videoId/:playlistId
  return res.data;
}

export async function removeVideoFromPlaylist(videoId, playlistId) {
  const res = await api.patch(`/playlist/remove/${videoId}/${playlistId}`); // Maps to backend /api/v1/playlist/remove/:videoId/:playlistId
  return res.data;
}

