import { api } from "./api";

export function getPlaylist(playlistId) {
  return api.get(`/playlist/${playlistId}`);
}

export function getUserPlaylists(userId) {
  return api.get(`/playlist/user/${userId}`);
}

export function createPlaylist({ name, description }) {
  return api.post("/playlist/", { name, description });
}

export function updatePlaylist(playlistId, { name, description }) {
  return api.patch(`/playlist/${playlistId}`, { name, description });
}

export function deletePlaylist(playlistId) {
  return api.delete(`/playlist/${playlistId}`);
}

export function clearPlaylistVideos(playlistId) {
  return api.delete(`/playlist/${playlistId}/videos`);
}

export function removeVideoFromPlaylist(playlistId, videoId) {
  return api.patch(`/playlist/remove/${videoId}/${playlistId}`);
} 